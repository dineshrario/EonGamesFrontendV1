

const Button = ({btn_name, onClick}) => {
    return (
        <>
            <button className="w-10 h-5" onClick={onClick}  >{btn_name}</button>
        </>
    )
}

export default Button