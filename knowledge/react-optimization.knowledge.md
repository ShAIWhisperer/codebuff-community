# React Code Optimization Guidelines

When analyzing and modifying React code, examine the following patterns and implement the corresponding optimizations:

<Unnecessary Rerenders>

1. **Component-Level Rerendering:** When analyzing code, identify if components are rerendering unnecessarily. Look for and fix the following patterns:

- **State Changes High in the Tree:** Search for state changes high in the component tree that cause children to rerender unnecessarily. For example, if you see this pattern:

```jsx
function ParentComponent() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <ExpensiveChild unrelatedProp="something" />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

Modify the code to isolate state updates through component splitting or lifting state.

- **Lack of Memoization:** When child components rerender even though their props haven't changed, implement `React.memo`. For example, transform this:

```jsx
const ChildComponent = ({ style }) => {
  console.log("ChildComponent rendering")
  return <div style={style}>Child</div>
}
```

Into this:

```jsx
const ChildComponent = React.memo(({ style }) => {
  console.log("ChildComponent rendering")
  return <div style={style}>Child</div>
})
```

2. **Prop Instability:**

- **Inline Objects/Arrays:** Look for and fix object or array literals passed as props inline. For example, transform this problematic pattern:

```jsx
function ParentComponent() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <ChildComponent style={{ color: "blue" }} />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

Into either this:

```jsx
const childStyle = { color: "blue" }

function ParentComponent() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <ChildComponent style={childStyle} />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

Or using `useMemo`:

```jsx
function ParentComponent() {
  const [count, setCount] = useState(0)
  const childStyle = useMemo(() => ({ color: "blue" }), [])
  return (
    <div>
      <ChildComponent style={childStyle} />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

- **Inline Functions:** Search for and fix functions defined inline within props. Transform this:

```jsx
<button onClick={() => handleClick()}>Click Me</button>
```

Into this:

```jsx
const handleButtonClick = useCallback(() => handleClick(), [])
// ...
<button onClick={handleButtonClick}>Click Me</button>
```

When dependencies are needed:

```jsx
const handleButtonClick = useCallback(() => handleClick(id), [id])
```

- **Inline Function, Stable Value:** When reviewing memoized functions, verify that the dependency array is correctly managed.

3. **Context Usage:** When examining React Context usage, check if context changes cause widespread rerendering. If found, implement more granular contexts or alternative state management. For example, transform this problematic pattern:

```jsx
const BigContext = React.createContext()

function Provider({ children }) {
  const [frequently, setFrequently] = useState(0)
  const [rarely, setRarely] = useState(0)
  
  const value = { frequently, rarely, setFrequently, setRarely }
  
  return (
    <BigContext.Provider value={value}>
      {children}
    </BigContext.Provider>
  )
}
```

Into this optimized version:

```jsx
const FrequentContext = React.createContext()
const RareContext = React.createContext()

function Provider({ children }) {
  const [frequently, setFrequently] = useState(0)
  const [rarely, setRarely] = useState(0)
  
  const frequentValue = useMemo(() => ({ frequently, setFrequently }), [frequently])
  const rareValue = useMemo(() => ({ rarely, setRarely }), [rarely])
  
  return (
    <FrequentContext.Provider value={frequentValue}>
      <RareContext.Provider value={rareValue}>
        {children}
      </RareContext.Provider>
    </FrequentContext.Provider>
  )
}
```

</Unnecessary Rerenders>

<Virtual DOM and Reconciliation>

When optimizing code, remember that React's rerendering process (running the component's function and performing the virtual DOM diff) is separate from actual DOM updates. While a rerender doesn't always mean a DOM update, unnecessary rerenders still consume computational resources and should be eliminated through the patterns above.

</Virtual DOM and Reconciliation>

When analyzing and modifying code, structure the changes as follows:

- **Problem Identification:** Identify the specific performance issue in the code.
- **Code Modification:** Apply the appropriate optimization pattern from above.
- **Verification:** Explain how the modification prevents unnecessary rerenders.
- **Testing:** Verify the optimization through React DevTools and performance monitoring.

Continue this process for each component or section of code being optimized.