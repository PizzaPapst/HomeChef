import React from 'react'

function CookingStep({step, text}) {
  return (
    <div className='flex flex-col flex-1 gap-2 leading-[1.75]'>
        <h3 className='text-brand-teal font-semibold text-lg'>Schritt {step}</h3>
        <p>{text}</p>
    </div>
  )
}

export default CookingStep