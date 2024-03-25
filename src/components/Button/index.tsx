
const Button = ({ text, icon, onClick, style }) => {
  return (
    <div
      className="custom-button"
      onClick={onClick}
      style={style}
    >
      <img
        src={icon}
      />
      <span>{text}</span>
    </div>
  );
};

export default Button;
