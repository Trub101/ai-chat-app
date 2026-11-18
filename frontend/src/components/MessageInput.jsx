import { useRef, useState } from "react";

const MAX_SIZE = 1600; // pictures are shrunk to at most 1600px, so uploads stay small and fast

// Reads a picture file, shrinks it, and returns it as a data URL ("data:image/jpeg;base64,...")
function readImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white"; // transparent parts become white instead of black
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("This file can't be read as a picture."));
    img.src = URL.createObjectURL(file);
  });
}

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);

  async function pickImage(e) {
    const file = e.target.files[0];
    e.target.value = ""; // lets the user pick the same file again
    if (!file) return;
    try {
      setImage(await readImage(file));
    } catch (err) {
      alert(err.message);
    }
  }

  async function submit() {
    const message = text.trim();
    if ((!message && !image) || disabled) return;
    const sentImage = image;
    setText("");
    setImage(null);
    const ok = await onSend(message, sentImage);
    if (!ok) {
      // give the text and picture back so the user can retry
      setText(message);
      setImage(sentImage);
    }
  }

  // Enter sends, Shift+Enter adds a new line
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="input-bar">
      {image && (
        <div className="preview">
          <img src={image} alt="Picture to send" />
          <button title="Remove picture" onClick={() => setImage(null)}>✕</button>
        </div>
      )}
      <button className="attach" title="Add a picture" onClick={() => fileRef.current.click()} disabled={disabled}>
        📎
      </button>
      <input type="file" accept="image/*" ref={fileRef} onChange={pickImage} hidden />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message the AI... (Shift+Enter for a new line)"
        maxLength={10000}
        rows={1}
      />
      <button onClick={submit} disabled={disabled || (!text.trim() && !image)}>Send</button>
    </div>
  );
}
