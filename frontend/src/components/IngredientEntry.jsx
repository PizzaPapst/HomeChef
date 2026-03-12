import React from 'react'

function IngredientEntry({ name, amount, unit, multiplicator }) {
  console.log(unit)
  const num = multiplicator * amount
  const rounded = Math.round(num * 1000) / 1000;
  return (
    <div className='flex flex-1 p-2'>
      <span className='w-1/3'>
        {`${unit != "Etwas" ? rounded : ""} ${unit}`}
      </span>
      <span className='flex flex-1'>{name}</span>
    </div>
  )
}


export default IngredientEntry