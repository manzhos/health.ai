import React from 'react';

export default function TestPage(){
  
  const TestCase = () => {

    const [thanks, setThanks] = React.useState('');

    const handleClick = () => {
      setThanks('Thank you for subscription');
      setTimeout(()=>{setThanks('')}, 1000);
    }

    return (
      <div>
        <p>
          {thanks}
        </p>
        <button onClick={handleClick}>subscribe</button>
      </div>
    );
  }

  return (
    <TestCase />
  );
}