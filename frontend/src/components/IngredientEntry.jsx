import React from 'react'

function IngredientEntry({name, amount, unit, multiplicator}) {
  const calculatedAmount = multiplicator*amount 
  return (
    <div className='flex flex-1 p-2'>
        <span className='w-1/3'>
            {`${calculatedAmount} ${unit}` }
        </span>
        <span className='flex flex-1'>{name}</span>
    </div>
  )
}


export default IngredientEntry