import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from "../models/user.js";
import Team from "../models/team.js";
dotenv.config();

export default async function updateLoggedState(teamName = null) {
    try {
        if (!teamName) {
            const users = await User.find();
            if (!users) {
                return;
            }
            for (let user of users) {
                updateOne(user);
            }
        }
        else {
            const team = await Team.findOne({ teamName }).populate('members');
            if (!team) {
                return;
            }
            for (let user of team.members) {
                updateOne(user);
            }
        }
        return;
    }
    catch (err) {
        console.error('Error updating logged in state:', err);
    }
   
}

async function updateOne(user) {
    if (user.currentToken) {
        try {
            const decoded = jwt.verify(user.currentToken, process.env.JWT_SECRET || 'notaverygoodsecret');
            user.loggedIn = true;
        } catch (err) {
            user.loggedIn = false;
        }
    }
    else {
        user.loggedIn = false;
    }
    await user.save();
}