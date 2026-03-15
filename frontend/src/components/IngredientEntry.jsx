import React from 'react'

function IngredientEntry({ name, amount, unit, multiplicator }) {
  const num = amount ? multiplicator * amount : null;
  const rounded = num ? Math.round(num * 1000) / 1000 : null;
  
  let amountStr = "";
  if (rounded !== null && unit !== "Etwas") {
    amountStr = `${rounded}`;
  }
  const unitStr = unit || "";
  
  const displayString = `${amountStr} ${unitStr}`.trim();

  return (
    <div className='flex flex-1 p-2'>
      <span className='w-1/3'>
        {displayString}
      </span>
      <span className='flex flex-1'>{name}</span>
    </div>
  )
}

export default IngredientEntry