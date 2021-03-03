const logicInput = document.querySelector("#logicInput");
const invalidInputText = document.querySelector("#invalidInputText")
const submitButton = document.querySelector("#submitButton")
const variablesList = document.querySelector("#variablesList")
const evaluationSpan = document.querySelector("#evaluationSpan")
const evaluationSteps = document.querySelector("#evaluationSteps")

const unerSymbols = "!"
const binerSymbols = "&|>"
const validVariables = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

let logicInputIsValid = false

const symbolStrengths = {
    '!' : 4,
    '&' : 3,
    '|' : 2,
    '>' : 1
}

function evaluateSymbol(a,symbol,b=undefined) {
    if(!(a === true || a === false)) {
        a = variableDict[a]
    }

    if(!(b === true || b === false)) {
        b = variableDict[b]
    }

    switch (symbol) {
        case '!': return !a; break;
        case '&': return a && b; break;
        case '|': return a || b; break;
        case '>': 
            if (a && !b) {
                return false
            } else {
                return true
            }
        
            ; break;
        default: console.log("Error when evaluating: ( " + a + ', ' + symbol + ', ' + b + ' )'); return undefined; break;
    }
}

function calculateTruthTable(expression) {
    let exprArr = Array.from(expression)

    let leftBracketCount = 0
    let priorityArr = []
    for(let i = 0; i < exprArr.length; i++) {

        if(unerSymbols.includes(exprArr[i]) || binerSymbols.includes(exprArr[i])) {
            priorityArr.push(leftBracketCount * 10 + symbolStrengths[exprArr[i]])
            //this way of calculating the priority will make it so that the innermost symbol always has the highest priority (represented by the 10^1 digit of priority's value)
            //also, the 10^0 digit of priority is used to store a symbol strength, ordering the symbols in the same bracket by their priority
            //now the sorting algorithm can only swap places of symbols in cases such as: ( A & B & C ) (where the two & symbols might be switched by some algorithms)
            //this obviously has no bearing on the final result
        } else {
            priorityArr.push(Number.NEGATIVE_INFINITY)
        }

        if(exprArr[i] == '(') {
            leftBracketCount++;
        } else if (exprArr[i] == ')') {
            leftBracketCount--
        } 
    }
    
    //console.log(exprArr.join(' ') + ' => len: ' + exprArr.length)
    //console.log(priorityArr.join(' ') + ' => len: ' + exprArr.length)

    //1. Find the highest number's index in priorityArr
    //2. Evaluate it with the character after, (uner) or character before and after (biner), paying attention to the fact that these characters can be 'true' or 'false' too
    //3. Examine if the characters before and after the expression are '(' and ')' respectively. If so, we'll need to remove those too
    //4. Splice out the correct indexes from priority arr, making sure to add 1 Number.NEGATIVE_INFINITY in the place of the first spliced index, and remove the rest
    //5. Do step 4. to the exprArr array, except add the result of the evaluation, instead of Number.NEGATIVE_INFINITY
    //6. Repeat steps 1.-5- until the length of the array is one
    //7. Return that last element
    let newLi = document.createElement("li")
    newLi.innerText=(exprArr.join(' '))
    evaluationSteps.appendChild(newLi)
    while(exprArr.length > 1) {
        maxInd = 0;
        for (let i = 1; i < priorityArr.length; i++) {
            if(priorityArr[i] > priorityArr[maxInd]) {
                maxInd = i
            }
        }

        let evaluation = false
        if(unerSymbols.includes(exprArr[maxInd])) {
            //uner symbol
            evaluation = evaluateSymbol(exprArr[maxInd + 1], exprArr[maxInd], null)

            if(exprArr[maxInd - 1] == '(' && exprArr[maxInd + 2] == ')') {
                priorityArr.splice(maxInd - 1, 4, Number.NEGATIVE_INFINITY)
                exprArr.splice(maxInd - 1, 4, evaluation)
            } else {
                priorityArr.splice(maxInd, 2, Number.NEGATIVE_INFINITY)
                exprArr.splice(maxInd, 2, evaluation)
            }
        } else if (binerSymbols.includes(exprArr[maxInd])) {
            //biner symbol
            evaluation = evaluateSymbol(exprArr[maxInd - 1], exprArr[maxInd], exprArr[maxInd + 1])
            
            if(exprArr[maxInd - 2] == '(' && exprArr[maxInd + 2] == ')') {
                priorityArr.splice(maxInd - 2, 5, Number.NEGATIVE_INFINITY)
                exprArr.splice(maxInd - 2, 5, evaluation)
            } else {
                priorityArr.splice(maxInd - 1, 3, Number.NEGATIVE_INFINITY)
                exprArr.splice(maxInd - 1, 3, evaluation)
            }
        } else {
            console.log("Error identifying symbol " + exprArr[maxInd] + " (not uner or biner)")
            return
        }

        let newLi = document.createElement("li")
        newLi.innerText=(exprArr.join(' '))
        evaluationSteps.appendChild(newLi)
    }

    return exprArr[0]
}

function reduceToValidSymbolsAndVariables(str) {
    return Array.from(str).filter(c => unerSymbols.includes(c) || binerSymbols.includes(c) || "()".includes(c) || validVariables.includes(c)).join('');
}

function handleLogicInputInputEvent() {
    logicInput.value = logicInput.value.toUpperCase();
    logicInput.value = reduceToValidSymbolsAndVariables(logicInput.value)

    logicInputIsValid = validateLogicStr(logicInput.value)
}

let variableDict = {}

function displayVariables(variables) {
    variablesArr = variables.filter(function(item,pos,self){
        return self.indexOf(item) == pos;
    })
    variablesList.innerHTML = '';
    
    for(let i = 0; i < variablesArr.length; i++) {
        var node = document.createElement("LI")
        node.innerText = variablesArr[i]
        variablesList.appendChild(node)
        variableDict[node.innerText] = true
    }
}

function validateLogicStr(str) {
    let arr = Array.from(str)

    let validationStr = unerSymbols + binerSymbols + validVariables + "()"
    let allSymbols = unerSymbols + binerSymbols

    displayVariables(arr.filter(e => validVariables.includes(e)))

    if (arr.every(e => validationStr.includes(e))) {  
        //at least the characters are okay

        if(arr.length == 0) {
            console.log('Empty string')
            return false
        }

        let openingBracketCount = 0;

        let lastChar = arr[0]
        
        let temp = arr.join('')
        arr = Array.from('x' + temp + 'x')


        /*
        if (lastChar == '(') {
            openingBracketCount++
        } else if (lastChar == ')' || binerSymbols.includes(lastChar)){
            console.log("Invalid character at index 0: " + lastChar);
            return false;
        }*/

        for(let i = 1; i < arr.length-1; i++) {
            if (arr[i] == "(") {
                openingBracketCount++;
                if(arr[i+1] == ')') {
                    console.log("Empty brackets at index " + i)
                    return false 
                }
            } else if (arr[i] == ")") {
                openingBracketCount--;
                if(arr[i-i] == '(' || allSymbols.includes(arr[i-1])) {
                    console.log("Invalid character at index " + i + ": " + arr[i-1])  
                    return false
                } 
            } else if (unerSymbols.includes(arr[i])) {
                if(arr[i+1] == ")" || binerSymbols.includes(arr[i+1]) || arr[i+1] == 'x') {
                    console.log("Invalid character at index " + i + ": " + arr[i+1])
                    return false
                } 
            } else if (binerSymbols.includes(arr[i])) {
                if((arr[i-1] != ')' && !validVariables.includes(arr[i-1])) || arr[i-1] == 'x' ) {
                    console.log("Invalid character at index " + i + ": " + arr[i-1])  
                    return false
                } else if ((arr[i+1] != "(" && !validVariables.includes(arr[i+1])) || arr[i+1] == 'x') {
                    console.log("Invalid character at index " + i + ": " + arr[i+1])
                    return false
                }
            } else if (validVariables.includes(arr[i])) {
                if(validVariables.includes(arr[i-1])){
                    console.log("Invalid character at index " + i + ": " + arr[i-1])  
                    return false
                } else if (validVariables.includes(arr[i+1]) || unerSymbols.includes(arr[i+1])) {
                    console.log("Invalid character at index " + i + ": " + arr[i+1])
                    return false
                } else if (arr[i-1] == '(' && arr[i+1] == ')') {
                    console.log("Variable " + arr[i] + " fully enclosed in brackets")
                    return false
                } 
            } else {
                console.log("Invalid character at index " + i + ": " + arr[i])
                return false
            }

            if (openingBracketCount < 0) {
                console.log("Negative opening bracket count at index " + i)
                return false
            }

            lastChar = arr[i]
        }

        return (openingBracketCount == 0)

    } else {
        console.log("Invalid character(s): " + arr.filter(e => !(validationStr.includes(e))) + " in: " + arr.join(''))
        displayVariables(variables)
        return false
    }
}

function submitLogicInput() {
    evaluationSteps.innerHTML = ' '
    if(logicInputIsValid) {
        console.log("Valid input: " + logicInput.value)
        invalidInputText.style.display = "none";
        evaluationSpan.innerText = ("Eredmény: " + calculateTruthTable(logicInput.value))
    } else {
        console.log("Invalid input: " + logicInput.value)
        invalidInputText.style.display = "block";
    }
}

logicInput.addEventListener("input", handleLogicInputInputEvent)
logicInput.addEventListener("keydown", (e) =>{
    if(e.key == 'Enter') {
        submitLogicInput();
    }
})
submitButton.addEventListener("click", submitLogicInput)

function delegate(parent, type, selector, handler) {
    parent.addEventListener(type, function (event) {
        const targetElement = event.target.closest(selector)
        if (this.contains(targetElement)) handler.call(targetElement, event)
    })
}

delegate(variablesList, "click","li",handleLiClick)

function handleLiClick(event) {
    if(variableDict[this.innerText]) {
        console.log("true branch")
        variableDict[this.innerText] = false
        this.style.color = "red"
    } else {
        console.log("false branch")
        variableDict[this.innerText] = true
        this.style.color = "white"
    }
    evaluationSteps.innerHTML = ' '
    submitLogicInput()
}