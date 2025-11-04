import logo from "../../assets/logo.svg";
import smallLogo from "../../assets/small-logo.svg";

const AppLogo = ({ style, className = "", width, height, ...rest }) => {
  const isSmall = (width && width <= 100) || (height && height <= 40);
  const src = isSmall ? smallLogo : logo;

  return (
    <img
      src={src}
      width={width}
      height={height}
      style={style}
      className={className}
      {...rest}
      alt="App Logo"
    />
  );
};

export default AppLogo;
