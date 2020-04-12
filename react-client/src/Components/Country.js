import React from 'react'


const Country = ({country, editCountries, onClick}) => {
    return <button type="button" className={`float-left btnCustom blue btn-sm mt-1 ${country.status?"sel":""} ${editCountries?"remove":""}`} onClick={onClick}>{country.name}</button>
}
 
export default Country;