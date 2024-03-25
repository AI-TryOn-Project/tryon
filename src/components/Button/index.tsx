import "./index.less";

const Button = ({ text, icon, onClick, style, iconStyle }) => {
  return (
    <div
      className="custom-button"
      onClick={onClick}
      style={style}
    >
      <img
        src={icon}
        style={iconStyle}
      />
      <span>{text}</span>
    </div>
  );
};

export default Button;
