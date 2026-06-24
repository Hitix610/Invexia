import {getBudgetsService} from "../services/budgets.service.js";

export const getBudgets = async (req, res) => {
    try {
        const data = await getBudgetsService(req.user.id)

        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

