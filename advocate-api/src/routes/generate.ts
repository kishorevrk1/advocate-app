import { Router, Request, Response } from 'express'
import { analyzeCase, CaseInput } from '../lib/claude'

const router = Router()

const VALID_CATEGORIES = ['deposit', 'charges', 'travel', 'invoice', 'product']

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { category, description, state, opponentName, amountDisputed, userName } = req.body

    // Validate required fields
    if (!category || !description || !state) {
      return res.status(400).json({
        error: 'Missing required fields: category, description, state'
      })
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      })
    }

    if (description.trim().length < 20) {
      return res.status(400).json({
        error: 'Description must be at least 20 characters'
      })
    }

    const caseInput: CaseInput = {
      category,
      description: description.trim(),
      state: state.toUpperCase(),
      opponentName: opponentName?.trim(),
      amountDisputed: amountDisputed ? parseFloat(amountDisputed) : undefined,
      userName: userName?.trim(),
    }

    const analysis = await analyzeCase(caseInput)

    res.json({
      success: true,
      analysis,
    })
  } catch (error: any) {
    console.error('Case analysis error:', error.message)
    res.status(500).json({
      error: 'Failed to analyze case. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

export default router
