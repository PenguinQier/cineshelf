function Test() {
    fetch('http://www.omdbapi.com/?i=tt3896198&apikey=a903aacf')
        .then((res) => res.json())
        .then((data) => console.log(data))
    return (
        <div>
            <h1>Test</h1>
            <p>Test</p>
        </div>
    )
}
export default Test;