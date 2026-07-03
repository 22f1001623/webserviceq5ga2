module.exports = async (req, res) => {
    // 1. Enforce strict cross-origin verification headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    // Instantly return successfully on CORS preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    // 2. Exact validation match for API key header
    const ASSIGNED_API_KEY = "ak_jnmb2ppzidw4kyii7x8qscrt";
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== ASSIGNED_API_KEY) {
        return res.status(401).json({ error: "Unauthorized. Missing or wrong API key." });
    }

    // 3. Process Events Payload
    const body = req.body || {};
    const events = body.events;
    if (!events || !Array.isArray(events)) {
        return res.status(400).json({ error: "Invalid request body. Expected an events array." });
    }

    const total_events = events.length;
    const uniqueUsersSet = new Set();
    const userRevenueMap = {};
    let totalRevenue = 0;

    events.forEach(event => {
        if (!event) return;
        const username = event.user;
        const amount = Number(event.amount) || 0;

        if (username) {
            uniqueUsersSet.add(username);
        }

        // Aggregate revenue and top user tracking using positive amounts only
        if (amount > 0 && username) {
            totalRevenue += amount;
            userRevenueMap[username] = (userRevenueMap[username] || 0) + amount;
        }
    });

    // Identify the top user with the highest positive revenue volume
    let top_user = "";
    let maxRevenue = -1;
    for (const [user, revenue] of Object.entries(userRevenueMap)) {
        if (revenue > maxRevenue) {
            maxRevenue = revenue;
            top_user = user;
        }
    }

    // 4. Return Output Payload
    return res.status(200).json({
        email: "22f1001623@ds.study.iitm.ac.in", //  MUST replace with your actual login email address!
        total_events: total_events,
        unique_users: uniqueUsersSet.size,
        revenue: totalRevenue,
        top_user: top_user
    });
};
