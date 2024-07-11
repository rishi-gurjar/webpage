How Gradient Boost is used for Regression
- when it is used to predict a continuous value, like weight

[[Decision Trees]]
[[AdaBoost]]
[[Bias and Variance]]

Adaboost vs Gradient Boost
- Adaboost starts with a stump and builds next stump based on errors the previous stump made. The better a stump corrects the previous stumps errors, the larger influence it will have
- Gradient Boost starts with a single leaf - an initial guess for all the weights of all of the samples. 
	- For a continuous feature, the first guess is the average value of all the samples
	- Then, it builds a tree (larger than a stump unlike AdaBoost) based on the errors of the previous one (like AdaBoost)
	- Scales the trees (like AdaBoost) by the same amount (unlike AdaBoost)
	- Continues to build trees until the tree count set is reached or additional trees fail to improve the fit.

Gradient Boost
1. Initial prediction (First leaf)
	1. Get average of all samples
2. Build a tree based on the errors of first tree
	1. Errors = Observed - Predicted value (Pseudo Residuals) for all samples
	2. Use all features to predict residuals not actual values
	3. For larger datasets, trees have anywhere from 8 - 32 leaves
3. Add first leaf and initial tree
	1. Go through the tree and add the first leaf and (resulting leaf * learning rate) to calculate the value
	2. Learning rate = value from 0 - 1 
4. Build next tree 
	1. Calculate pseudo residuals
		1. Observed value - new predicted value = pseudo residual
		2. Residuals should be getting closer to 0 with each new tree 
	2. Add first leaf to initial and second tree - scale both trees by the learning rate (0.1 in this case)
	3. Each time we add a tree to the prediction, the residuals get smaller

[[Gradient Descent]]

Gradient Boost algorithm; need data and a loss function:

![[Screenshot 2024-02-17 at 2.56.10 PM.png]]
*We have some data*

$x_i$ = each sample used to predict the target variable
$y_i$ = the target variable observation for each s ample
$i = [1,n]$ = the range of the iterator

![[Screenshot 2024-02-17 at 3.00.43 PM.png]]
*Differentiable Loss Function*

Loss Function: something that evaluates how off we are from predicting the target variable. Typical one: $\frac{1}{2}(Observed - Predicted)^2$. 
- 1/2 is used because after differentiating and using the chain rule, the 2/2 cancel out, so we are left with a negative residual (easier to deal with)

Linear Regression Loss Function: $(Observed - Predicted)^2$ 

**Step 1**: Initialize model with a constant value
![[Screenshot 2024-02-17 at 3.09.12 PM.png]]
$y_i$ = observed values
$\gamma$ = predicted values
$\sum\limits_{i=1}^{n}$ = We add up one Loss Function for each observed value
$\frac{argmin}{\gamma}$ = We need to find a predicted value that minimizes the sum 
$F_{0}(x)$ = Initial predicted value (just a leaf)

Derive each term with respect to Predicted. (e.g. $\frac{1}{2}(88 - Predicted)^2$ ) and solve for 0 (the bottom of the parabola). Could use gradient descent but this is easier = results in the leaf $F_{0}(x)$

**Step 2**: Loop where we make all of the trees
<u>Part A</u>

$m$ = Individual tree. When $m = 1$, we are talking about the first tree
$M$ = Number of trees. When $m = M$, we are talking about the last tree

Most people set $M$ to 100
![[Screenshot 2024-02-17 at 3.38.35 PM.png]]
*Derivative of the loss function with respect to the Predicted value * -1*

= $(Observed - Predicted)$ That whole thing is just a Residual

Then, plug $F_{(m-1)}(x)$ in for Predicted
- $m = 1, (Observed - F_{(1-1)}(x)$ 
- $r_{im}$ = Pseudo residual
	- i = sample number
	- m = tree we are trying to build (Nested for loop)

Calculate $r_{im}$ for $i = 1,...,n$  for $m = 1, ..., M$ 

<u>Part B</u>

1. Fit a regression tree to the $r_{im}$ values  
	1. Build a regression tree to predict the pseudo residuals rather than the target variable for each feature
2. Label terminal regions $R_{jm}$ for $j = 1,...,J_m$. 
	1. j is the index for each leaf in the tree
	2. $J_m$ = number of leaves in m

<u>Part C</u>

![[Screenshot 2024-02-17 at 3.49.09 PM.png]]
*Determine the Output (gamma) value ($\gamma_{jm}$) for each leaf $j$
- the output value for each leaf is the value for gamma that minimizes the sum of the loss function
- This minimization is similar to Step 1 but 
	- now we are taking the previous Prediction into account ($F_{m-1} (x_i)$)
	- now we are only including samples that result in the leaf $R_y$ $\sum\limits_{x_{i \in R_y}}$

<u>Part D</u>

![[Screenshot 2024-02-17 at 4.08.34 PM.png]]
*Make a new prediction for each sample*

Based on the last prediction we made: $F_{m-1}(x)$ 
Summation is there just in case a single sample ends up in multiple leaves
- It says we should add up the output values ($\gamma_{j,m}$) for all the leaves $R_{j,m}$ that a sample $x$ can be found in
- $\nu$ (nu) is the learning rate, value between 0 and 1
	- A small learning rate reduces the effect each tree has on the final prediction, improving accuracy in the long run

Step 3: Output $F_{M}(x)$ - the output from the final tree in the Gradient Boost algorithm

[[Logistic Regression]]

[[Gradient Boost for Classification]]