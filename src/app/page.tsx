import data from "./data";

const AppPage = () => (
  <>
    <div style={{ padding: "0 30px" }}>
      <h1>
        <span>Obsidian Tournament  /  </span>
        <span style={{ color: "#A1A1AA" }}>Season 1</span>
      </h1>

      <img
        src="qwe.png"
        alt="Bracket"
        style={{
          width: "150px", height: "auto", position: "fixed", right: 20, bottom: 20,
        }}
      />
    </div>

    <iframe
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)" }}
      title="Bracket"
      src="https://brackethq.com/b/qzznc/embed/?zoom=0"
      width="100%"
      height="320"
      frameBorder="0"
    />

    <div style={{
      display: "flex", flexWrap: "wrap", padding: "20px 20px 77px 20px", fontFamily: "'Roboto', sans-serif",
    }}
    >
      {data.map(({ id, name, players }) => (
        <div style={{ width: 300, margin: 10, boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" }} key={id}>
          <div>
            <div
              style={{
                backgroundColor: "#555555",
                padding: 10,
                boxShadow: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)",
              }}
            >
              <h4 style={{ margin: 0 }}>{name}</h4>
            </div>

            <div style={{ backgroundColor: "#444444" }}>
              {players.map(({ firstName, lastName, nickname }) => (
                <div style={{ borderBottom: "1px solid black", padding: 8 }} key={nickname}>
                  <span>{firstName}</span>
                  <span style={{ color: "#A1A1AA", padding: "0 10px" }}>{nickname}</span>
                  <span>{lastName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
);

export default AppPage;
