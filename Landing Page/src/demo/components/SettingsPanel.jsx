function SettingsPanel({
  darkMode,
  setDarkMode
}) {

  return (

    <div className="panel">

      <h3>Settings</h3>

      <div className="setting-row">

        <span>Dark Mode</span>

        <button
          className={
            darkMode
              ? "toggle active-toggle"
              : "toggle"
          }
          onClick={() =>
            setDarkMode(!darkMode)
          }
        >

          <div className="toggle-circle"></div>

        </button>

      </div>

    </div>

  )

}

export default SettingsPanel