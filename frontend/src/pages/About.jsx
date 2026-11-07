const STACK = [
  { name: "React", desc: "Single-page app with a chat UI and page routing" },
  { name: "FastAPI", desc: "Python REST API with Pydantic validation" },
  { name: "MySQL", desc: "Stores every conversation and message" },
  { name: "Claude AI", desc: "Anthropic's model, called only from the server" },
  { name: "Docker", desc: "Runs the whole project with one command" },
];

export default function About() {
  return (
    <div className="about">
      <section className="hero">
        <h1>About the Project</h1>
        <p>
          AI Chat is a full-stack chat application in the spirit of ChatGPT and Claude. You can hold long
          conversations with an AI assistant, come back to any previous chat later, and the assistant
          continues with the full context of what was said.
        </p>
      </section>

      <section>
        <h2>Tech Stack</h2>
        <div className="cards">
          {STACK.map((item) => (
            <div className="card" key={item.name}>
              <h3>{item.name}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="developer">
        <div className="avatar">DT</div>
        <div>
          <h2>Daniel Trubiner</h2>
          <p className="role">Full-Stack Developer</p>
          <p>
            I'm a full-stack developer who enjoys building clean, practical web applications, from the
            database and server all the way to the user interface. I like turning ideas into simple,
            well-organized code that is easy to read and maintain.
          </p>
          <a className="github" href="https://github.com/Trub101" target="_blank" rel="noreferrer">
            GitHub: github.com/Trub101
          </a>
        </div>
      </section>
    </div>
  );
}
