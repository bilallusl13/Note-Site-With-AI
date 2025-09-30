"use client"
import React, { useState } from 'react';
import './calculator.css';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, op: string): number => {
    switch (op) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '%':
        return firstValue % secondValue;
      case '^':
        return Math.pow(firstValue, secondValue);
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    if (!previousValue || !operation) return;

    const inputValue = parseFloat(display);
    const newValue = calculate(previousValue, inputValue, operation);

    setDisplay(String(newValue));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const handleScientific = (func: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    switch (func) {
      case 'sin':
        result = Math.sin(inputValue * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(inputValue * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(inputValue * Math.PI / 180);
        break;
      case 'log':
        result = Math.log10(inputValue);
        break;
      case 'ln':
        result = Math.log(inputValue);
        break;
      case 'sqrt':
        result = Math.sqrt(inputValue);
        break;
      case 'square':
        result = inputValue * inputValue;
        break;
      case 'factorial':
        result = factorial(inputValue);
        break;
      case 'inverse':
        result = 1 / inputValue;
        break;
      case 'abs':
        result = Math.abs(inputValue);
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const handleMemory = (action: string) => {
    const inputValue = parseFloat(display);
    
    switch (action) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(String(memory));
        setWaitingForOperand(true);
        break;
      case 'M+':
        setMemory(memory + inputValue);
        setWaitingForOperand(true);
        break;
      case 'M-':
        setMemory(memory - inputValue);
        setWaitingForOperand(true);
        break;
    }
  };

  const handleBackspace = () => {
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h1>🧮 Hesap Makinesi</h1>
        <p>Bilimsel hesaplamalar için gelişmiş hesap makinesi</p>
      </div>

      <div className="calculator-wrapper">
        <div className="calculator">
          {/* Display */}
          <div className="display">
            <div className="display-expression">
              {previousValue !== null && operation && `${previousValue} ${operation}`}
            </div>
            <div className="display-value">{display}</div>
          </div>

          {/* Memory Row */}
          <div className="memory-row">
            <button onClick={() => handleMemory('MC')} className="btn-memory">MC</button>
            <button onClick={() => handleMemory('MR')} className="btn-memory">MR</button>
            <button onClick={() => handleMemory('M+')} className="btn-memory">M+</button>
            <button onClick={() => handleMemory('M-')} className="btn-memory">M-</button>
          </div>

          {/* Scientific Functions */}
          <div className="scientific-row">
            <button onClick={() => handleScientific('sin')} className="btn-scientific">sin</button>
            <button onClick={() => handleScientific('cos')} className="btn-scientific">cos</button>
            <button onClick={() => handleScientific('tan')} className="btn-scientific">tan</button>
            <button onClick={() => handleScientific('log')} className="btn-scientific">log</button>
            <button onClick={() => handleScientific('ln')} className="btn-scientific">ln</button>
          </div>

          <div className="scientific-row">
            <button onClick={() => handleScientific('sqrt')} className="btn-scientific">√</button>
            <button onClick={() => handleScientific('square')} className="btn-scientific">x²</button>
            <button onClick={() => handleScientific('factorial')} className="btn-scientific">x!</button>
            <button onClick={() => handleScientific('inverse')} className="btn-scientific">1/x</button>
            <button onClick={() => handleScientific('abs')} className="btn-scientific">|x|</button>
          </div>

          {/* Main Calculator Buttons */}
          <div className="button-grid">
            <button onClick={clearDisplay} className="btn-clear">C</button>
            <button onClick={handleBackspace} className="btn-clear">⌫</button>
            <button onClick={() => performOperation('%')} className="btn-operator">%</button>
            <button onClick={() => performOperation('÷')} className="btn-operator">÷</button>

            <button onClick={() => inputDigit('7')} className="btn-number">7</button>
            <button onClick={() => inputDigit('8')} className="btn-number">8</button>
            <button onClick={() => inputDigit('9')} className="btn-number">9</button>
            <button onClick={() => performOperation('×')} className="btn-operator">×</button>

            <button onClick={() => inputDigit('4')} className="btn-number">4</button>
            <button onClick={() => inputDigit('5')} className="btn-number">5</button>
            <button onClick={() => inputDigit('6')} className="btn-number">6</button>
            <button onClick={() => performOperation('-')} className="btn-operator">-</button>

            <button onClick={() => inputDigit('1')} className="btn-number">1</button>
            <button onClick={() => inputDigit('2')} className="btn-number">2</button>
            <button onClick={() => inputDigit('3')} className="btn-number">3</button>
            <button onClick={() => performOperation('+')} className="btn-operator">+</button>

            <button onClick={() => inputDigit('0')} className="btn-number btn-zero">0</button>
            <button onClick={inputDecimal} className="btn-number">.</button>
            <button onClick={() => performOperation('^')} className="btn-operator">^</button>
            <button onClick={handleEquals} className="btn-equals">=</button>
          </div>
        </div>
      </div>
    </div>
  );
} 