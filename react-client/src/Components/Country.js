import React from 'react'

const Country = ({country, editCountries, onClick, onMouseOver, onMouseOut}) => {
    const btRef = React.createRef();
    return <button type="button" className={`float-left btnCustom blue btn-sm mt-1 ${country.status?"sel selected":""} ${editCountries?"remove":""}`} ref={btRef} onClick={onClick} onMouseOver={onMouseOver.bind(btRef)} onMouseOut={onMouseOut.bind(btRef)}>{country.name}</button>
}
 
export default Country;