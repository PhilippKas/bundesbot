"use client";
import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState("spd");
  const [context, setContext] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setContext([]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, source}),
      });

      const data = await response.json();
      setContext(data.context);
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAnswer("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
    <div className="slogan">
        <h1>Frag doch mal flott den Bundesbot</h1>
        <h4>Denn seien wir mal ehrlich, wer nimmt sich die Zeit, ein Wahlprogramm zu lesen?</h4>
    </div>
      <div className="chat-box-container">
        <select
          className="select-options"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
            <option value="spd">SPD</option>
            <option value="cdu">CDU</option>
            <option value="grune">Grüne</option>
            <option value="fdp">FDP</option>
            <option value="afd">AfD</option>
            <option value="linke">Linke</option>
            <option value="bsw">BSW</option>
        </select>

        <div className="chat-input">
            <textarea
            className="chatbox"
            rows={3}
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                askQuestion();
              }
            }}
            />

            <button
            onClick={askQuestion}
            className="sendChat"
            disabled={loading}
            >
            {loading ? "Thinking..." : (
                <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="40px" fill="#ffffff" className="search-icon">
                    <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
                </svg>
            )}
            </button>
        </div>

        {answer && (
          <div className="response">
            <h2 className="">Answer:</h2>
            <p className="">{answer}</p>
          </div>
        )}

        {context && context.length > 0 && (
          <div className="response">
            <h2 className="">Context:</h2>
            {context.map((line, index) => <p key={index} className="reference">{line}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}   
