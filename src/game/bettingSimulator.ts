// src/game/bettingSimulator.ts
// Betting simulator for use with the simulated racing engine.
// Supports WIN, PLACE, EACH_WAY, and MULTI (parlay) across legs.
// Settles using decimal odds; derives PLACE odds from WIN via configurable factors.
// No external deps. Ready to plug into UI + your createRaceSimulation() module.

export type CategoryId =
	| '4a2788f8-e825-4d36-9894-efd4baf1cfae' // Horse
	| '9daef0d7-bf3c-4f50-921d-8e818c60fe61' // Greyhound
	| '161d9be2-e909-4326-8c2c-35ed71fb460b' // Harness
	| string

export type WagerType = 'WIN' | 'PLACE' | 'EACH_WAY' | 'MULTI'

export interface RunnerQuote {
	runnerId: string
	number: number
	name: string
	decimalOdds: number | null // null => SP/unknown; we will treat as 6.00 default unless you override
}

export interface RaceQuote {
	raceId: string
	meetingName: string
	raceNumber: number
	categoryId: CategoryId
	advertisedStartMs: number
	runners: RunnerQuote[]
	// Optional field size to drive place terms; if omitted, we infer from runners.length
	fieldSize?: number
}

export interface RaceResult {
	raceId: string
	placings: string[] // runnerIds ordered 1..last
	finishTimesMs: Record<string, number>
}

export interface BankrollSnapshot {
	balance: number
	locked: number
	settledProfitLoss: number
	turnover: number
}

export interface BetLeg {
	raceId: string
	selectionRunnerId: string
	selectionName: string
	oddsDecimalAtPlacement: number // WIN decimal odds at placement (snapshot)
	// Derived place odds factorised from win; filled at placement for consistency
	placeOddsDecimal: number
	categoryId: CategoryId
	fieldSize: number
}

export interface BetBase {
	betId: string
	placedAtMs: number
	stake: number // for MULTI: this is the unit stake applied to leg multiplier
	type: WagerType
	status: 'PENDING' | 'WON' | 'LOST' | 'VOID' | 'SETTLED_PARTIAL'
	potentialReturn?: number // snapshot (for UI only)
}

export interface SingleBet extends BetBase {
	type: 'WIN' | 'PLACE' | 'EACH_WAY'
	leg: BetLeg
}

export interface MultiBet extends BetBase {
	type: 'MULTI'
	legs: BetLeg[]
	// progressive cashout calc helper (optional UI feature)
	progressiveReturn?: number
}

export type Bet = SingleBet | MultiBet

export interface SettlementRecord {
	betId: string
	type: WagerType
	stake: number
	result: 'WON' | 'LOST' | 'VOID'
	payout: number // stake + profit for winning; stake for void; 0 for lost
	profitLoss: number // payout - stake (for EACH_WAY, sum of components)
	breakdown: string // human-readable details for receipts
	settledAtMs: number
}

export interface BettingConfig {
	defaultSpDecimal: number // used if odds missing
	// Place terms by category: multiplier applied to (winOdds - 1); placeOdds = 1 + factor*(winOdds-1)
	placeTerms: Record<string, { factor: number; places: (fieldSize: number) => number }>
	maxLegsMulti: number
	minStake: number
	currency: string
}

export const DEFAULT_CONFIG: BettingConfig = {
	defaultSpDecimal: 6.0,
	placeTerms: {
		// Typical UK-style approximations, tweak as desired
		'4a2788f8-e825-4d36-9894-efd4baf1cfae': { // Horse
			factor: 0.25,
			places: (n) => (n >= 8 ? 3 : n >= 5 ? 2 : 1)
		},
		'161d9be2-e909-4326-8c2c-35ed71fb460b': { // Harness (approx)
			factor: 0.25,
			places: (n) => (n >= 8 ? 3 : n >= 5 ? 2 : 1)
		},
		'9daef0d7-bf3c-4f50-921d-8e818c60fe61': { // Greyhound
			factor: 0.33,
			places: (n) => (n >= 8 ? 3 : n >= 5 ? 2 : 1)
		},
		default: {
			factor: 0.25,
			places: (n) => (n >= 8 ? 3 : n >= 5 ? 2 : 1)
		}
	},
	maxLegsMulti: 10,
	minStake: 0.1,
	currency: 'Credits'
}

/* --------------------------------- Helpers -------------------------------- */

function pickTerms(cfg: BettingConfig, cat: CategoryId) {
	return cfg.placeTerms[cat] ?? cfg.placeTerms['default']
}

function derivePlaceOddsDecimal(winDecimal: number, cfg: BettingConfig, cat: CategoryId): number {
	const terms = pickTerms(cfg, cat)
	const overOne = Math.max(0, winDecimal - 1)
	return 1 + terms.factor * overOne
}

function getPlacesAllowed(cfg: BettingConfig, cat: CategoryId, fieldSize: number): number {
	const terms = pickTerms(cfg, cat)
	return Math.max(1, terms.places(fieldSize))
}

function decimalOddsOrSP(odds: number | null | undefined, cfg: BettingConfig): number {
	return odds && odds > 1.01 ? Number(odds) : cfg.defaultSpDecimal
}

function fmt(n: number): string {
	return (Math.round(n * 100) / 100).toFixed(2)
}

/* ------------------------------- Main Engine ------------------------------ */

export class BettingEngine {
	private cfg: BettingConfig
	private balance: number
	private locked: number
	private settledPnl: number
	private turnover: number
	private bets: Map<string, Bet>
	private raceToPendingBets: Map<string, Set<string>>

	constructor(initialBankroll = 1000, cfg: BettingConfig = DEFAULT_CONFIG) {
		this.cfg = cfg
		this.balance = initialBankroll
		this.locked = 0
		this.settledPnl = 0
		this.turnover = 0
		this.bets = new Map()
		this.raceToPendingBets = new Map()
	}

	getBankroll(): BankrollSnapshot {
		return { balance: this.balance, locked: this.locked, settledProfitLoss: this.settledPnl, turnover: this.turnover }
	}

	listBets(): Bet[] {
		return Array.from(this.bets.values()).sort((a, b) => a.placedAtMs - b.placedAtMs)
	}

	/* ---------------------------- Bet Placement --------------------------- */

	placeSingleWin(rq: RaceQuote, runnerId: string, stake: number, betId: string): SingleBet {
		return this.placeSingle(rq, runnerId, stake, betId, 'WIN')
	}

	placeSinglePlace(rq: RaceQuote, runnerId: string, stake: number, betId: string): SingleBet {
		return this.placeSingle(rq, runnerId, stake, betId, 'PLACE')
	}

	placeSingleEachWay(rq: RaceQuote, runnerId: string, stake: number, betId: string): SingleBet {
		// EACH_WAY: stake is total stake (split 50/50 into WIN and PLACE components)
		return this.placeSingle(rq, runnerId, stake, betId, 'EACH_WAY')
	}

	placeMulti(legs: Array<{ rq: RaceQuote; runnerId: string }>, stake: number, betId: string): MultiBet {
		if (legs.length < 2) throw new Error('MULTI requires at least 2 legs')
		if (legs.length > this.cfg.maxLegsMulti) throw new Error(`MULTI max legs ${this.cfg.maxLegsMulti}`)
		this.ensureStake(stake)

		const builtLegs: BetLeg[] = legs.map(({ rq, runnerId }) => {
			const r = rq.runners.find(x => x.runnerId === runnerId)
			if (!r) throw new Error(`Runner ${runnerId} not found in race ${rq.raceId}`)
			const winOdds = decimalOddsOrSP(r.decimalOdds, this.cfg)
			const placeOdds = derivePlaceOddsDecimal(winOdds, this.cfg, rq.categoryId)
			return {
				raceId: rq.raceId,
				selectionRunnerId: r.runnerId,
				selectionName: r.name,
				oddsDecimalAtPlacement: winOdds,
				placeOddsDecimal: placeOdds,
				categoryId: rq.categoryId,
				fieldSize: rq.fieldSize ?? rq.runners.length
			}
		})

		const potential = builtLegs.reduce((acc, leg) => acc * leg.oddsDecimalAtPlacement, 1) * stake
		const bet: MultiBet = {
			betId,
			placedAtMs: Date.now(),
			stake,
			type: 'MULTI',
			status: 'PENDING',
			legs: builtLegs,
			potentialReturn: Number(fmt(potential))
		}
		this.lockFunds(stake)
		this.storeBet(bet)
		for (const leg of builtLegs) this.indexBetForRace(leg.raceId, bet.betId)
		return bet
	}

	private placeSingle(rq: RaceQuote, runnerId: string, stake: number, betId: string, type: 'WIN' | 'PLACE' | 'EACH_WAY'): SingleBet {
		this.ensureStake(stake)
		const r = rq.runners.find(x => x.runnerId === runnerId)
		if (!r) throw new Error(`Runner ${runnerId} not found in race ${rq.raceId}`)
		const winOdds = decimalOddsOrSP(r.decimalOdds, this.cfg)
		const placeOdds = derivePlaceOddsDecimal(winOdds, this.cfg, rq.categoryId)
		const fieldSize = rq.fieldSize ?? rq.runners.length
		const leg: BetLeg = {
			raceId: rq.raceId,
			selectionRunnerId: r.runnerId,
			selectionName: r.name,
			oddsDecimalAtPlacement: winOdds,
			placeOddsDecimal: placeOdds,
			categoryId: rq.categoryId,
			fieldSize
		}

		const potential = (() => {
			if (type === 'WIN') return stake * winOdds
			if (type === 'PLACE') return stake * placeOdds
			// EACH_WAY: half stake on WIN and half on PLACE
			const half = stake / 2
			return half * winOdds + half * placeOdds
		})()

		const bet: SingleBet = {
			betId,
			placedAtMs: Date.now(),
			stake,
			type,
			status: 'PENDING',
			leg,
			potentialReturn: Number(fmt(potential))
		}
		this.lockFunds(stake)
		this.storeBet(bet)
		this.indexBetForRace(rq.raceId, bet.betId)
		return bet
	}

	/* ------------------------------- Cancels ------------------------------ */

	// Optional: allow cancel before advertised start
	tryCancel(betId: string, raceClockMs: number, advertisedStartMs: number): boolean {
		const bet = this.bets.get(betId)
		if (!bet) return false
		if (bet.status !== 'PENDING') return false
		if (raceClockMs >= advertisedStartMs) return false // market closed
		this.unlockFunds(bet.stake)
		bet.status = 'VOID'
		this.postSettle(bet, { payout: bet.stake, profitLoss: 0, result: 'VOID', breakdown: 'Cancelled pre-start' })
		return true
	}

	/* ----------------------------- Settlement ----------------------------- */

	// Call this when a simulated race finishes. It settles single bets for that race,
	// and advances/parlays MULTIs. Returns settlement records for UI.
	settleRace(result: RaceResult): SettlementRecord[] {
		const impacted = this.raceToPendingBets.get(result.raceId)
		if (!impacted || impacted.size === 0) return []
		const records: SettlementRecord[] = []
		for (const betId of Array.from(impacted)) {
			const bet = this.bets.get(betId)
			if (!bet || bet.status !== 'PENDING') continue

			if (bet.type === 'MULTI') {
				const rec = this.progressMulti(bet as MultiBet, result)
				if (rec) records.push(rec)
				// if still pending, keep it indexed for remaining legs
			} else {
				const rec = this.settleSingle(bet as SingleBet, result)
				records.push(rec)
			}
		}
		// Clean index for this race after settlements
		this.raceToPendingBets.delete(result.raceId)
		return records
	}

	private settleSingle(bet: SingleBet, result: RaceResult): SettlementRecord {
		const leg = bet.leg
		const position = result.placings.indexOf(leg.selectionRunnerId) + 1 // 1-based; 0 => not found
		const placesAllowed = getPlacesAllowed(this.cfg, leg.categoryId, leg.fieldSize)
		let payout = 0
		let breakdown = ''
		let finalResult: 'WON' | 'LOST' | 'VOID' = 'LOST'

		if (bet.type === 'WIN') {
			if (position === 1) {
				payout = bet.stake * leg.oddsDecimalAtPlacement
				finalResult = 'WON'
				breakdown = `WIN @ ${fmt(leg.oddsDecimalAtPlacement)} (P1)`
			} else {
				payout = 0
				breakdown = `WIN lost (P${position || 'DNF'})`
			}
		} else if (bet.type === 'PLACE') {
			if (position >= 1 && position <= placesAllowed) {
				payout = bet.stake * leg.placeOddsDecimal
				finalResult = 'WON'
				breakdown = `PLACE @ ${fmt(leg.placeOddsDecimal)} (P${position}/${placesAllowed})`
			} else {
				payout = 0
				breakdown = `PLACE lost (P${position || 'DNF'}, pays ${placesAllowed})`
			}
		} else {
			const half = bet.stake / 2
			let winPart = 0
			let placePart = 0
			let winWon = false
			let placeWon = false
			if (position === 1) {
				winPart = half * leg.oddsDecimalAtPlacement
				winWon = true
			}
			if (position >= 1 && position <= placesAllowed) {
				placePart = half * leg.placeOddsDecimal
				placeWon = true
			}
			payout = winPart + placePart
			finalResult = winWon || placeWon ? (winWon && placeWon ? 'WON' : 'SETTLED_PARTIAL') as any : 'LOST'
			breakdown = `E/W: WIN@${fmt(leg.oddsDecimalAtPlacement)} ${winWon ? '✓' : '✗'} + PLACE@${fmt(leg.placeOddsDecimal)} ${placeWon ? '✓' : '✗'} (P${position || 'DNF'}, pays ${placesAllowed})`
		}

		this.unlockFunds(bet.stake)
		this.credit(payout)
		bet.status = finalResult === 'VOID' ? 'VOID' : finalResult
		return this.postSettle(bet, { payout, profitLoss: payout - bet.stake, result: finalResult, breakdown })
	}

	private progressMulti(bet: MultiBet, result: RaceResult): SettlementRecord | null {
		// Identify which leg this result belongs to
		const idx = bet.legs.findIndex(l => l.raceId === result.raceId)
		if (idx === -1) return null

		// Compute whether selection won this leg; MULTI uses WIN outcomes
		const leg = bet.legs[idx]
		const won = result.placings[0] === leg.selectionRunnerId

		// Track progressive multiplier
		if (won) {
			const multiplierBefore = bet.progressiveReturn ? bet.progressiveReturn / bet.stake : 1
			const nextMultiplier = multiplierBefore * leg.oddsDecimalAtPlacement
			bet.progressiveReturn = bet.stake * nextMultiplier
		} else {
			// Lose entire multi
			this.unlockFunds(bet.stake)
			bet.status = 'LOST'
			return this.postSettle(bet, {
				payout: 0,
				profitLoss: -bet.stake,
				result: 'LOST',
				breakdown: `Leg ${idx + 1}/${bet.legs.length} lost: ${leg.selectionName} WIN@${fmt(leg.oddsDecimalAtPlacement)}`
			})
		}

		// If this was the last leg, pay out
		const remaining = bet.legs.slice(idx + 1)
		if (remaining.length === 0) {
			const payout = bet.progressiveReturn ?? 0
			this.unlockFunds(bet.stake)
			this.credit(payout)
			bet.status = 'WON'
			return this.postSettle(bet, {
				payout,
				profitLoss: payout - bet.stake,
				result: 'WON',
				breakdown: `MULTI won. Legs: ${bet.legs.length}, Return: ${fmt(payout)}`
			})
		}

		// Still pending: keep indexed for the next legs
		return null
	}

	/* ------------------------------ Accounting ---------------------------- */

	private ensureStake(stake: number) {
		if (stake < this.cfg.minStake) throw new Error(`Min stake ${this.cfg.minStake}`)
		if (stake > this.balance) throw new Error('Insufficient funds')
	}

	private lockFunds(stake: number) {
		this.balance -= stake
		this.locked += stake
		this.turnover += stake
	}

	private unlockFunds(stake: number) {
		this.locked -= stake
		this.balance += stake
	}

	private credit(amount: number) {
		this.balance += amount
		this.settledPnl += amount
	}

	private storeBet(b: Bet) {
		this.bets.set(b.betId, b)
	}

	private indexBetForRace(raceId: string, betId: string) {
		if (!this.raceToPendingBets.has(raceId)) this.raceToPendingBets.set(raceId, new Set())
		this.raceToPendingBets.get(raceId)!.add(betId)
	}

	private postSettle(bet: Bet, info: { payout: number; profitLoss: number; result: 'WON' | 'LOST' | 'VOID'; breakdown: string }): SettlementRecord {
		const rec: SettlementRecord = {
			betId: bet.betId,
			type: bet.type,
			stake: bet.stake,
			result: info.result,
			payout: Number(fmt(info.payout)),
			profitLoss: Number(fmt(info.profitLoss)),
			breakdown: info.breakdown,
			settledAtMs: Date.now()
		}
		return rec
	}
}

/* -------------------------------- Wiring UX ------------------------------- */
/*
Example usage (with your existing simulated race engine):

import { createRaceSimulation } from '../sim/simulatedRace'
import { BettingEngine } from './bettingSimulator'

// 1) Build quotes from public API snapshot (WIN odds)
const rq: RaceQuote = {
  raceId: 'SIM_WARRAGUL_R12',
  meetingName: 'Warragul',
  raceNumber: 12,
  categoryId: '9daef0d7-bf3c-4f50-921d-8e818c60fe61',
  advertisedStartMs: Date.now() + 30000,
  runners: [
	{ runnerId: 'r1', number: 1, name: 'Got Immunity', decimalOdds: 2.4 },
	{ runnerId: 'r2', number: 2, name: 'She\'s Our Art', decimalOdds: 3.4 },
	{ runnerId: 'r3', number: 3, name: 'Disco Gizmo', decimalOdds: 6.0 },
	{ runnerId: 'r4', number: 4, name: 'Rumour Not Fact', decimalOdds: 11.0 },
	{ runnerId: 'r5', number: 5, name: 'Daintree Granite', decimalOdds: 13.0 }
  ],
  fieldSize: 8
}

const engine = new BettingEngine(1000)

// 2) Player places bets before start
engine.placeSingleWin(rq, 'r1', 20, 'B001')         // WIN 20 @ 2.40
engine.placeSingleEachWay(rq, 'r3', 10, 'B002')     // E/W total stake 10 (5 win + 5 place)
engine.placeMulti([{ rq, runnerId: 'r1' }, { rq, runnerId: 'r2' }], 5, 'B003') // silly same-race multi for demo

// 3) Run the simulated race
const sim = createRaceSimulation({
  id: rq.raceId,
  meetingName: rq.meetingName,
  raceNumber: rq.raceNumber,
  categoryId: rq.categoryId,
  runners: rq.runners.map(r => ({ id: r.runnerId, number: r.number, name: r.name, decimalOdds: r.decimalOdds ?? undefined }))
}, 12345, 200)

sim.onFinish((res) => {
  // 4) Settle bets when sim finishes
  const records = engine.settleRace({ raceId: res.raceId, placings: res.placings, finishTimesMs: res.finishTimesMs })
  console.table(records)
  console.log('Bankroll:', engine.getBankroll())
})

sim.start()

// UI notes:
// - Hook engine.listBets() to your slip panel.
// - Show engine.getBankroll() top-right.
// - Disable place/cancel once Date.now() >= advertisedStartMs.
// - Add a "Simulated" badge and never present this as real wagering.
*/
