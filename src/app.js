import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import mongoose from '../connection/mongodb.js'
import { Note } from '../model/noteSchema.js'

const app = express()
dotenv.config({
  path: './src/.env'
});

app.use(express.json());

const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, 'public')));

app.get("/Notes", async (req, res) => {
  try {
    const Notes = await Note.find();
    res.send(Notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/Notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const mongoId = new mongoose.Types.ObjectId(id);
    const Notes = await Note.findById(mongoId);
    res.json(Notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/Notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const mongoId = new mongoose.Types.ObjectId(id);
    const deletedNote = await Note.findOneAndRemove({ "_id": mongoId });

    if (!deletedNote) {
      return res.status(404).json({ msg: "Note is not found" });
    }

    res.status(200).json({
      status: "SUCCESS",
      msg: "Note deleted successfully",
      data: deletedNote,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/Notes", async (req, res) => {
  const { date, title } = req.body;
  try {
    const Notes = new Note({ date, title });
    await Notes.save();
    res.status(200).json({
      status: "Success",
      msg: "Add note SuccessFully",
      data: Notes
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/Notes/move/:id", async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  try {
    const mongoId = new mongoose.Types.ObjectId(id);
    const updatedNote = await Note.findByIdAndUpdate(mongoId, { date }, { new: true });
    if (!updatedNote) {
      return res.status(404).json({ msg: "Note is not found" });
    }
    res.status(200).json({
      status: "SUCCESS",
      msg: "Note moved successfully",
      data: updatedNote,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/Notes/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const mongoId = new mongoose.Types.ObjectId(id);
    const updatedNote = await Note.findByIdAndUpdate(mongoId, { title }, { new: true });
    if (updatedNote) {
      res.status(200).json({
        status: "SUCCESS",
        msg: "Note Update successfully",
        data: updatedNote,
      });
    } else {
      return res.status(404).json({ msg: "Note is not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 2000
const hostname = process.env.HOST

app.listen(port, () => console.log(`listening on URL===> http://${hostname}:${port}`))


