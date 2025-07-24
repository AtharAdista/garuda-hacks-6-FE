import "./styles/App.css";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <>
      <NavBar />
      <div id="Home" className="relative z-0 mt-[-4rem]">
        <HomePage />
      </div>
    </>
  );
}

export default App;
