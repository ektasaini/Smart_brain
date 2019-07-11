
import React from 'react';
import './Rank.css';

const Rank = ({name,enteries})=>{

	return (

         <div>
         <div className=' f3 font'>  {`${name}, your current entry count is...`} </div>
         <div className=' f1 font'>   {enteries} </div>
         </div>
		)
}

export default Rank ;