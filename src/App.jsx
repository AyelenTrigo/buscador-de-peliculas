import "./App.css";

import { useCallback, useEffect, useRef, useState } from "react";
//Use ref es un hook que te permite crear una referencia mutable que persiste durante todo el ciclo de vida de tu compomente. La diferencia con use state es que useRef no renderiza cada vez que se actualiza en componente, este puede cambiar su valor que useRef no permite volver a renderizarlo
import { useMovies } from "./hooks/useMovies";
import { Movies } from "./components/Movies";
import debounce from "just-debounce-it";

function useSearch() {
  const [search, updateSearch] = useState("");
  const [error, setError] = useState(null);
  const isFirstInput = useRef(true);

  useEffect(() => {
    if (isFirstInput.current) {
      isFirstInput.current = search === "";
      console.log(isFirstInput.current);
      return;
    }
    if (search == "") {
      setError("No se puede buscar una película vacía");
      return;
    }

    if (search.match(/^\d+$/)) {
      setError("No se puede buscar una película con un número");
      return;
    }
    if (search.length < 3) {
      setError("La búsqueda debe tener al menos 3 caracteres");
      return;
    }
    setError(null);
  }, [search]);
  return { search, updateSearch, error };
}

function App() {
  const [ sort, setSort ] = useState(false)
  const { search, updateSearch, error } = useSearch();
  const { movies, loading, getMovies } = useMovies({ search, sort});

  //Para evitar que se haga la búsqueda continuamente al escribir (debounce) se utiliza la libreria Debounce
  //Para que no cree un nuevo debounce y se de cuenta que son la misma funcion (useCallback)
  //useCallback hace que la función se ejecute 1 sola vez
  const debounceGetMovies = useCallback(
    debounce(search => {
      console.log('search', search)
      getMovies({ search })
    }, 500)
    , [getMovies]
  )

  const handleSubmit = (event) => {
    event.preventDefault();
    getMovies({ search });
  };

  const handleSort = () => {
    setSort(!sort)
  }
  const handleChange = (event) => {
    const newSearch = event.target.value
    updateSearch(newSearch);
    debounceGetMovies(newSearch)
  };

  return (
    <div className="page">
      <header>
        <h1>Buscador de peliculas</h1>
        <form className="form" onSubmit={handleSubmit}>
          <input
            style={{
              border: "1px solid transparent",
              borderColor: error ? "red" : "transparent",
            }}
            onChange={handleChange}
            type="text"
            placeholder="Avengers, Star Wars, The Matrix..."
          />
          <input type="checkbox" onChange={handleSort} checked={sort}></input>
          <button type="submit">Buscar</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </header>

      <main>{loading ? <p>Cargando... </p> : <Movies movies={movies} />}</main>
    </div>
  );
}

export default App;
