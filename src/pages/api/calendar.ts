import { getToken } from "next-auth/jwt";
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req });
  if (!token || !token.accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { start, end } = req.query;

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token.accessToken as string });

  const calendar = google.calendar({ version: "v3", auth });

  const result = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date(start as string).toISOString(),
    timeMax: new Date(end as string).toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.status(200).json(result.data.items);
}
