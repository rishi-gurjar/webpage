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

import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
    Bar,
    BarChart,
    Cell,
    LabelList,
    Label,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
    PolarAngleAxis,
    Pie,
    PieChart,
    Tooltip,
    Legend,
    AreaChart,
    Area,
    ResponsiveContainer
} from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart"

// Add this interface near the top of your file, before the component
interface PsychProfile {
  gender: string;
  source: string;
  loses_sight_of_goals: boolean;
  goal_areas: string;
  feels_regret: string;
  life_difference: string;
  desire_level: string;
  [key: string]: any; // For any other properties
}

// Create a new interface for the transformed data
interface FormattedPsychProfile extends Omit<PsychProfile, 'loses_sight_of_goals'> {
    loses_sight_of_goals: string;
}

const chartConfig = {
    gender: {
        label: "Gender",
        color: "hsl(var(--chart-1))",
    },
    source: {
        label: "Source",
        color: "hsl(var(--chart-2))",
    },
    loses_sight_of_goals: {
        label: "Loses Sight of Goals",
        color: "hsl(var(--chart-3))",
    },
    goal_areas: {
        label: "Goal Areas",
        color: "hsl(var(--chart-4))",
    },
    feels_regret: {
        label: "Feels Regret",
        color: "hsl(var(--chart-5))",
    },
    life_difference: {
        label: "Life Difference",
        color: "hsl(var(--chart-6))",
    },
    desire_level: {
        label: "Desire Level",
        color: "hsl(var(--chart-7))",
    }
} satisfies ChartConfig

// Custom color palettes for each chart
const GENDER_COLORS = ['#8884d8', '#82ca9d', '#ffc658']; // Purple, Green, Yellow
const SOURCE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']; // Blue, Teal, Yellow, Orange, Purple
const GOALS_COLORS = ['#ff5252', '#7cb342', '#ffb649', '#ff7b25']; // Red, Orange, Yellow, Green
const GOAL_AREAS_COLORS = ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a']; // Blues to Greens
const REGRET_COLORS = ['#4caf50', '#cddc39', '#ffc107', '#ff5722']; // Green to Red
const LIFE_DIFF_COLORS = ['#9c27b0', '#673ab7', '#3f51b5']; // Purple to Blue
const DESIRE_COLORS = ['#b3e5fc', '#4fc3f7', '#0288d1', '#01579b']; // Light Blue to Dark Blue

export default function NudgeDashboard() {
    
    const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://0a03-128-84-126-30.ngrok-free.app'
    : 'http://localhost:3001';

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    
    // State for each chart data
    const [genderData, setGenderData] = useState<any[]>([])
    const [sourceData, setSourceData] = useState<any[]>([])
    const [losesGoalsData, setLosesGoalsData] = useState<any[]>([])
    const [goalAreasData, setGoalAreasData] = useState<any[]>([])
    const [feelsRegretData, setFeelsRegretData] = useState<any[]>([])
    const [lifeDifferenceData, setLifeDifferenceData] = useState<any[]>([])
    const [desireLevelData, setDesireLevelData] = useState<any[]>([])
    const [totalProfiles, setTotalProfiles] = useState(0)
    const [userGrowthData, setUserGrowthData] = useState<any[]>([])
    const [dailyActiveUsers, setDailyActiveUsers] = useState<any[]>([])
    const [monthlyActiveUsers, setMonthlyActiveUsers] = useState<any[]>([])
    const [retentionData, setRetentionData] = useState<any[]>([])

    // Helper function to count occurrences and format for charts
    const countAndFormat = (data: PsychProfile[], field: keyof PsychProfile, isList: boolean = false) => {
        const counts: Record<string, number> = {}
        
        data.forEach(item => {
            if (isList && item[field]) {
                // Make sure the value is a string before splitting
                const fieldValue = String(item[field])
                // Split comma-separated values and count each one
                const values = fieldValue.split(',').map((v: string) => v.trim())
                values.forEach((value: string) => {
                    if (value) {
                        counts[value] = (counts[value] || 0) + 1
                    }
                })
            } else {
                const value = item[field]
                if (value) {
                    counts[value] = (counts[value] || 0) + 1
                }
            }
        })
        
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }

    // Fetch all data from API
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            
            // Fetch all profiles from API instead of Supabase
            const response = await fetch(`${API_URL}/api/nudge/psych-profiles`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            
            const { data, count } = await response.json()
            
            if (data) {
                // Set total count
                setTotalProfiles(count || data.length)
                
                // Process data for each chart
                setGenderData(countAndFormat(data as PsychProfile[], 'gender'))
                setSourceData(countAndFormat(data as PsychProfile[], 'source'))
                
                // For boolean loses_sight_of_goals, convert to categories
                const losesGoalsFormatted = (data as PsychProfile[]).map((item: PsychProfile) => ({
                    ...item,
                    loses_sight_of_goals: item.loses_sight_of_goals ? 'Yes' : 'No'
                })) as FormattedPsychProfile[]
                setLosesGoalsData(countAndFormat(losesGoalsFormatted as any, 'loses_sight_of_goals'))
                
                setGoalAreasData(countAndFormat(data as PsychProfile[], 'goal_areas', true))
                setFeelsRegretData(countAndFormat(data as PsychProfile[], 'feels_regret'))
                setLifeDifferenceData(countAndFormat(data as PsychProfile[], 'life_difference'))
                setDesireLevelData(countAndFormat(data as PsychProfile[], 'desire_level'))
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setIsLoading(false)
        }
    }, [API_URL])

    const fetchUserGrowthData = useCallback(async () => {
        try {
            // Fetch user data from consolidated endpoint
            const response = await fetch(`${API_URL}/api/nudge/user-data`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            
            const { data } = await response.json();
            
            if (data && data.length > 0) {
                // Group by day for growth chart
                const dateGroups: Record<string, number> = {};
                
                data.forEach((profile: any) => {
                    if (profile.created_at) {
                        // Format date as YYYY-MM-DD
                        const date = new Date(profile.created_at).toISOString().split('T')[0];
                        dateGroups[date] = (dateGroups[date] || 0) + 1;
                    }
                });
                
                // Convert to cumulative growth
                let cumulativeCount = 0;
                const growthData = Object.entries(dateGroups)
                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                    .map(([date, count]) => {
                        cumulativeCount += count;
                        return {
                            date,
                            users: cumulativeCount
                        };
                    });
                
                setUserGrowthData(growthData);
                
                // Calculate DAU and MAU from the same data
                calculateActiveUsers(data);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setUserGrowthData([]);
        }
    }, [API_URL]);

    // Add this helper function to calculate active users
    const calculateActiveUsers = useCallback((data: any[]) => {
        // Get current date and time
        const now = new Date();
        
        // For DAU - users active in the last 24 hours
        const oneDayAgo = new Date(now);
        oneDayAgo.setHours(now.getHours() - 24);
        
        // For MAU - users active in the last 30 days
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        // Count DAU and MAU
        const dailyActiveUsersSet = new Set();
        const monthlyActiveUsersSet = new Set();
        
        // Process each profile
        data.forEach(profile => {
            if (profile.updated_at) {
                const updatedAt = new Date(profile.updated_at);
                
                // Check for DAU - active in last 24 hours
                if (updatedAt >= oneDayAgo) {
                    dailyActiveUsersSet.add(profile.id);
                }
                
                // Check for MAU - active in last 30 days
                if (updatedAt >= thirtyDaysAgo) {
                    monthlyActiveUsersSet.add(profile.id);
                }
            }
        });
        
        // Set DAU as a single number
        setDailyActiveUsers([{ 
            name: 'Daily Active Users', 
            value: dailyActiveUsersSet.size 
        }]);
        
        // Set MAU as a single number
        setMonthlyActiveUsers([{ 
            name: 'Monthly Active Users', 
            value: monthlyActiveUsersSet.size 
        }]);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
            fetchUserGrowthData(); // This now handles both growth and active users
        }
    }, [isAuthenticated, fetchData, fetchUserGrowthData]);

    const handleLogin = async () => {
        try {
            setIsLoading(true)
            
            // Call the server API route for password validation
            const response = await fetch(`${API_URL}/api/validate-nudge-dash-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ password })
            });
            
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                setIsAuthenticated(true);
            } else {
                alert("HAHAHAHAHAHA");
            }
        } catch (error) {
            console.error('Error validating password:', error);
            alert("HAHAHAHAHAHA rishi asleep :(");
        } finally {
            setIsLoading(false);
        }
    };

    // Add this formatter function near the top of your component
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (!isAuthenticated) {
        return (
            <div>
                <PageTracker path={`/nudge/dash`} />
                <div className="flex items-center justify-center min-h-screen">
                    <Card className="w-[350px]">
                        <CardHeader>
                            <CardTitle>Nudge Dash</CardTitle>
                            <CardDescription>Enter key</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <Input
                                    type="password"
                                    placeholder="Enter admin password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleLogin()}
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={handleLogin}
                                >
                                    {isLoading ? 'Authenticating...' : 'Access Dashboard'}
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
            <PageTracker path={`/nudge/dash`} />
            <h1 className="text-4xl p-4 font-semibold tracking-tight">A Very Humble Seaman&apos;s Compass</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                <PageTracker path={`/nudge/dash-authenticated`} />
                
                {/* Gender Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gender Distribution</CardTitle>
                        <CardDescription>Breakdown of users by gender</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                
                {/* Source Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Source</CardTitle>
                        <CardDescription>How users discovered Nudge</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <PieChart>
                                <Pie
                                    data={sourceData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label
                                >
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                
                {/* Loses Sight of Goals */}
                <Card>
                    <CardHeader>
                        <CardTitle>Loses Sight of Goals</CardTitle>
                        <CardDescription>How often users lose sight of their goals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <PieChart>
                                <Pie
                                    data={losesGoalsData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label
                                >
                                    {losesGoalsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GOALS_COLORS[index % GOALS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                
                {/* Goal Areas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Goal Areas</CardTitle>
                        <CardDescription>Primary goal areas for users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <PieChart>
                                <Pie
                                    data={goalAreasData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label
                                >
                                    {goalAreasData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GOAL_AREAS_COLORS[index % GOAL_AREAS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                
                {/* Feels Regret */}
                <Card>
                    <CardHeader>
                        <CardTitle>Feels Regret</CardTitle>
                        <CardDescription>How often users feel regret about not achieving goals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <PieChart>
                                <Pie
                                    data={feelsRegretData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label
                                >
                                    {feelsRegretData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={REGRET_COLORS[index % REGRET_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                
                {/* Life Difference */}
                <Card>
                    <CardHeader>
                        <CardTitle>Life Difference</CardTitle>
                        <CardDescription>How different users&apos; lives would be if they achieved goals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <PieChart>
                                <Pie
                                    data={lifeDifferenceData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label
                                >
                                    {lifeDifferenceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={LIFE_DIFF_COLORS[index % LIFE_DIFF_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                
                {/* Desire Level */}
                <Card>
                    <CardHeader>
                        <CardTitle>Desire Level</CardTitle>
                        <CardDescription>How strongly users desire to achieve their goals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <PieChart>
                                <Pie
                                    data={desireLevelData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label
                                >
                                    {desireLevelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={DESIRE_COLORS[index % DESIRE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="mb-4 flex flex-col">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-center">Total users</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 flex-grow flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="text-[150px] font-bold text-purple-500 text-center">
                                {totalProfiles}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4">
                {/* Daily Active Users (DAU) */}
                <Card className="col-span-1 md:col-span-1 p-4">
                    <CardHeader>
                        <CardTitle>DAU</CardTitle>
                        <CardDescription>Last 24 hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-green-500">
                                    {dailyActiveUsers[0]?.value || 0}
                                </div>
                                <div className="text-gray-500 mt-2">
                                    Users
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            {userGrowthData.length > 0 && dailyActiveUsers[0]?.value > 0 && (
                                <>
                                    {((dailyActiveUsers[0]?.value / userGrowthData[userGrowthData.length - 1]?.users) * 100).toFixed(1)}% of total
                                </>
                            )}
                        </div>
                    </CardFooter>
                </Card>

                {/* Monthly Active Users (MAU) */}
                <Card className="col-span-1 md:col-span-1 p-4">
                    <CardHeader>
                        <CardTitle>MAU</CardTitle>
                        <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-blue-500">
                                    {monthlyActiveUsers[0]?.value || 0}
                                </div>
                                <div className="text-gray-500 mt-2">
                                    Users
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            {userGrowthData.length > 0 && monthlyActiveUsers[0]?.value > 0 && (
                                <>
                                    {((monthlyActiveUsers[0]?.value / userGrowthData[userGrowthData.length - 1]?.users) * 100).toFixed(1)}% of total
                                </>
                            )}
                        </div>
                    </CardFooter>
                </Card>

                {/* User Growth Over Time */}
                <Card className="col-span-1 md:col-span-4 p-4">
                    <CardHeader>
                        <CardTitle>User Growth Over Time</CardTitle>
                        <CardDescription>Cumulative signups</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={userGrowthData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={formatDate}
                                        interval="preserveStartEnd"
                                        minTickGap={30}
                                    />
                                    <YAxis />
                                    <Tooltip labelFormatter={formatDate} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="users" 
                                        stroke="#8884d8" 
                                        strokeWidth={2}
                                        dot={false}
                                        name="Total Users"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            {userGrowthData.length > 0 && (
                                <>
                                    Total: {userGrowthData[userGrowthData.length - 1]?.users || 0} users
                                    <TrendingUp className="h-4 w-4" />
                                </>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}