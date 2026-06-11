export default function ThemeSwitcher() {
  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.getAttribute("data-theme") === "light") {
      html.setAttribute("data-theme", "night");
    } else {
      html.setAttribute("data-theme", "light");
    }
  };

  return (
    <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
      Toggle Theme
    </button>
  );
}
