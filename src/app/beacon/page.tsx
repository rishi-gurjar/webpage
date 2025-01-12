'use client'
import { PageTracker } from '@/app/blog/PageTracker';
import { useState, useEffect, useCallback } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Bar, BarChart, Cell, LabelList } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart"
const chartConfig = {
    mental: {
        label: "Mental",
        color: "hsl(var(--chart-1))",
    },
    physical: {
        label: "Physical",
        color: "hsl(var(--chart-2))",
    },
    sleep: {
        label: "Sleep",
        color: "hsl(var(--chart-1))",
    }
} satisfies ChartConfig

export default function BeaconPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [sleepData, setSleepData] = useState<any[]>([])
    const [mentalphysData, setMentalphysData] = useState<any[]>([])
    const [workoutData, setWorkoutData] = useState<any[]>([])

    const API_URL = process.env.NODE_ENV === 'production'
        ? 'https://6b06-128-84-127-255.ngrok-free.app'
        : 'http://localhost:3001';

    const fetchSleepData = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/sleep-time`);
            const data = await response.json();
            setSleepData(data);
        } catch (error) {
            console.error('Error fetching sleep data:', error);
        }
    }, [API_URL]);

    const fetchMentalphysData = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/mentalphys-check`);
            const data = await response.json();
            setMentalphysData(data);
        } catch (error) {
            console.error('Error fetching mental and phys data:', error);
        }
    }, [API_URL]);

    const fetchWorkoutData = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/workouts`);
            const data = await response.json();
            setWorkoutData(data);
        } catch (error) {
            console.error('Error fetching workout data:', error);
        }
    }, [API_URL]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSleepData();
            fetchMentalphysData();
            fetchWorkoutData();
        }
    }, [isAuthenticated, fetchSleepData, fetchMentalphysData, fetchWorkoutData, API_URL]);

    const handleLogin = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`${API_URL}/api/validate-beacon-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            })

            const data = await response.json()

            if (data.success) {
                setIsAuthenticated(true)
            } else {
                alert('Incorrect password')
                setPassword("")
            }
        } catch (error) {
            alert('Error validating password')
            console.error('Login error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isAuthenticated) {
        return (
            <div>
                <PageTracker path={`/beacon`} />
                <div className="flex items-center justify-center min-h-screen">
                    <Card className="w-[350px]">
                        <CardHeader>
                            <CardTitle>Rishi&apos;s Protected Beacon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <Input
                                    type="password"
                                    placeholder="Enter private key"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleLogin()}
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={handleLogin}
                                >
                                    {isLoading ? 'Checking...' : 'Ad astra per aspera'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        )
    }

    return (
        <div>
            <h1 className="text-4xl p-4 font-semibold tracking-tight">Beacon</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                <PageTracker path={`/beacon-accepted`} />
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Sleep</CardTitle>
                            <CardDescription>Daily sleep time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[29vh] w-full">
                                <LineChart
                                    accessibilityLayer
                                    data={sleepData}
                                    margin={{
                                        left: 2,
                                        right: 12,
                                        top: 12,
                                        bottom: 12
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        domain={[4, 'auto']}
                                        label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Line
                                        name="Sleep"
                                        dataKey="sleep"
                                        type="natural"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 font-medium leading-none">
                                {sleepData.length > 0 && (
                                    <>
                                        WTD mean: {(sleepData.slice(-7).reduce((acc, curr) => {
                                            const sleepHours = typeof curr.sleep === 'string' ?
                                                parseFloat(curr.sleep) : curr.sleep;
                                            return acc + sleepHours;
                                        }, 0) / Math.min(sleepData.length, 7)).toFixed(1)} hours
                                        <TrendingUp className="h-4 w-4" />
                                    </>
                                )}
                            </div>
                            <div className="leading-none text-muted-foreground">
                                Showing sleep data for the last {sleepData.length} days
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Mental and Physical Health</CardTitle>
                            <CardDescription>Daily mental and physical health score (0-10)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[29vh] w-full">
                                <LineChart
                                    accessibilityLayer
                                    data={mentalphysData}
                                    margin={{
                                        left: 2,
                                        right: 12,
                                        top: 12,
                                        bottom: 12
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        domain={[0, 10]}
                                        label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                        verticalAlign="bottom"
                                        align="right"
                                    />
                                    <Line
                                        name="Mental"
                                        dataKey="mental"
                                        type="natural"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        name="Physical"
                                        dataKey="physical"
                                        type="natural"
                                        stroke="hsl(var(--chart-1))"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 font-medium leading-none">
                                {mentalphysData.length > 0 && (
                                    <>
                                        WTD mental mean: {(mentalphysData.slice(-7).reduce((acc, curr) => {
                                            const mentalScore = typeof curr.mental === 'string' ?
                                                parseFloat(curr.mental) : curr.mental;
                                            return acc + mentalScore;
                                        }, 0) / Math.min(mentalphysData.length, 7)).toFixed(1)} / 10
                                        <TrendingUp className="h-4 w-4" />
                                    </>
                                )}

                                {mentalphysData.length > 0 && (
                                    <>
                                        WTD physical mean: {(mentalphysData.slice(-7).reduce((acc, curr) => {
                                            const physicalScore = typeof curr.physical === 'string' ?
                                                parseFloat(curr.physical) : curr.physical;
                                            return acc + physicalScore;
                                        }, 0) / Math.min(mentalphysData.length, 7)).toFixed(1)} / 10
                                        <TrendingUp className="h-4 w-4" />
                                    </>
                                )}

                            </div>
                            <div className="leading-none text-muted-foreground">
                                Showing mental and physical health data for the last {mentalphysData.length} days
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Inside Workouts</CardTitle>
                            <CardDescription>Workouts inside for more than 45 minutes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[21vh] w-full">
                                <BarChart accessibilityLayer data={workoutData}>
                                    <CartesianGrid vertical={false} />
                                    <ChartTooltip
                                        cursor={false}
                                        content={({ active, payload }) => {
                                            if (!active || !payload || !payload[0]) return null;
                                            
                                            const value = payload[0].value as number;
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <span className="text-[0.70rem] text-muted-foreground">
                                                        {value > 0 ? "Worked out" : "Didn&apos;t workout"}
                                                    </span>
                                                </div>
                                            );
                                        }}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={3}
                                    />
                                    <Bar dataKey="inside">
                                        {workoutData.map((item) => (
                                            <Cell
                                                key={item.date}
                                                fill={
                                                    item.inside > 0
                                                        ? "#2563eb"
                                                        : "hsl(var(--chart-1))"
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 font-medium leading-none">
                                {workoutData.length > 0 && (
                                    <>
                                        {workoutData.slice(-7).filter(day => day.inside > 0).length} 
                                        {workoutData.slice(-7).filter(day => day.inside > 0).length === 1 ? ' workout' : ' workouts'} in the last 7 days
                                        <TrendingUp className="h-4 w-4" />
                                    </>
                                )}
                            </div>
                            <div className="leading-none text-muted-foreground">
                                Showing workout data for the last {workoutData.length} days
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Outside Workouts</CardTitle>
                            <CardDescription>Workouts outside for more than 45 minutes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[21vh] w-full">
                                <BarChart accessibilityLayer data={workoutData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={3}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={({ active, payload }) => {
                                            if (!active || !payload || !payload[0]) return null;
                                            
                                            const value = payload[0].value as number;
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <span className="text-[0.70rem] text-muted-foreground">
                                                        {value > 0 ? "Worked out" : "Didn&apos;t workout"}
                                                    </span>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Bar dataKey="outside">
                                        {workoutData.map((item) => (
                                            <Cell
                                                key={item.date}
                                                fill={
                                                    item.outside > 0
                                                        ? "#2563eb"
                                                        : "hsl(var(--chart-1))"
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 font-medium leading-none">
                                {workoutData.length > 0 && (
                                    <>
                                        {workoutData.slice(-7).filter(day => day.outside > 0).length} 
                                        {workoutData.slice(-7).filter(day => day.outside > 0).length === 1 ? ' workout' : ' workouts'} in the last 7 days
                                        <TrendingUp className="h-4 w-4" />
                                    </>
                                )}
                            </div>
                            <div className="leading-none text-muted-foreground">
                                Showing workout data for the last {workoutData.length} days
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}