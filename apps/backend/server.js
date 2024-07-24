import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { openAIChain, parser } from "./modules/openAI.mjs";

import { lipSync } from "./modules/lip-sync.mjs";
import { sendDefaultMessages } from "./modules/defaultMessages.mjs";
import { convertAudioToText } from "./modules/whisper.mjs";
// import { fetchData } from "./modules/ASR.mjs";
import axios from 'axios';

dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;
// import axios from 'axios';

// const getVoices = async (apiKey) => {
//   try {
//     const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
//       headers: {
//         'xi-api-key': apiKey
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching voices:', error);
//   }
// };


app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

app.post("/tts", async (req, res) => {
  const userMessage = await req.body.message;
  if (await sendDefaultMessages({ userMessage })) return;
  let openAImessages = await openAIChain.invoke({
    question: userMessage,
    format_instructions: parser.getFormatInstructions(),
  });
  openAImessages = await lipSync({ messages: openAImessages.messages });
  res.send({ messages: openAImessages });
});

app.post("/sts", async (req, res) => {
  const base64Audio = req.body.audio;
  const audioData = Buffer.from(base64Audio, "base64");
  const userMessage = await convertAudioToText({ audioData });
  let openAImessages = await openAIChain.invoke({
    question: userMessage,
    format_instructions: parser.getFormatInstructions(),
  });
  openAImessages = await lipSync({ messages: openAImessages.messages });
  res.send({ messages: openAImessages });
});

app.listen(port, () => {
  console.log(`Jack are listening on port ${port}`);
});

