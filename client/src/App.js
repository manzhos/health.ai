import React, {useState} from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('hello')

  const buttonHandler = () => {
    console.log('hi');
    const src = 'http://localhost:3300/hi'
    axios.get(src,{
      headers: {"Content-Type": "application/json"},
    }).then((res) => {
      console.log(res)
      setMessage(res.data)
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {message}
        </p>
        <button onClick={buttonHandler}>say 'hi'</button>
      </header>
    </div>
  );
}

export default App;
