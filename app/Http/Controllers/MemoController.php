<?php

namespace App\Http\Controllers;

use App\Models\MemoLeaderboard;
use Illuminate\Http\Request;

class MemoController extends Controller
{
    public function memoLeaderboard()
    {
        $rows = MemoLeaderboard::query()
            ->with('user:id,name')
            ->orderByDesc('score')
            ->orderBy('completion_seconds')
            ->orderBy('id')
            ->limit(10)
            ->get();

        return response()->json([
            'rows' => $rows->map(function (MemoLeaderboard $row) {
                return $this->mapLeaderboardRow($row);
            }),
        ]);
    }

    public function submitMemoScore(Request $request)
    {
        $data = $request->validate([
            'base_score' => 'required|integer|min:0|max:999999',
            'completion_seconds' => 'required|integer|min:1|max:36000',
            'moves' => 'required|integer|min:1|max:1000',
            'hint_used' => 'sometimes|boolean',
        ]);

        $finalScore = $this->calculateMemoScore(
            (int) $data['base_score'],
            (int) $data['completion_seconds'],
            (int) $data['moves'],
            (bool) ($data['hint_used'] ?? false)
        );

        MemoLeaderboard::create([
            'user_id' => auth()->id(),
            'score' => $finalScore,
            'base_score' => (int) $data['base_score'],
            'completion_seconds' => (int) $data['completion_seconds'],
            'moves' => (int) $data['moves'],
            'hint_used' => (bool) ($data['hint_used'] ?? false),
        ]);

        $this->enforceMemoLeaderboardRules();

        $rows = MemoLeaderboard::query()
            ->with('user:id,name')
            ->orderByDesc('score')
            ->orderBy('completion_seconds')
            ->orderBy('id')
            ->limit(10)
            ->get();

        return response()->json([
            'score' => $finalScore,
            'rows' => $rows->map(function (MemoLeaderboard $row) {
                return $this->mapLeaderboardRow($row);
            }),
        ]);
    }

    private function calculateMemoScore(int $baseScore, int $seconds, int $moves, bool $hintUsed): int
    {
        $timeBonus = max(0, 180 - $seconds) * 4;
        $timePenalty = max(0, $seconds - 180) * 2;
        $movePenalty = max(0, $moves - 8) * 5;
        $hintPenalty = $hintUsed ? 35 : 0;

        return max(0, $baseScore + $timeBonus - $timePenalty - $movePenalty - $hintPenalty);
    }

    private function enforceMemoLeaderboardRules(): void
    {
        $topThree = MemoLeaderboard::query()
            ->orderByDesc('score')
            ->orderBy('completion_seconds')
            ->orderBy('id')
            ->limit(3)
            ->get(['user_id']);

        $topThreeCounts = $topThree->groupBy('user_id')->map->count();

        $groupedByUser = MemoLeaderboard::query()
            ->orderByDesc('score')
            ->orderBy('completion_seconds')
            ->orderBy('id')
            ->get(['id', 'user_id'])
            ->groupBy('user_id');

        foreach ($groupedByUser as $userId => $rows) {
            $allowedRows = min(3, max(1, (int) ($topThreeCounts[(int) $userId] ?? 0)));
            if ($rows->count() <= $allowedRows) {
                continue;
            }
            $idsToDelete = $rows->slice($allowedRows)->pluck('id')->all();
            if ($idsToDelete) {
                MemoLeaderboard::whereIn('id', $idsToDelete)->delete();
            }
        }
    }

    private function mapLeaderboardRow(MemoLeaderboard $row): array
    {
        return [
            'id' => $row->id,
            'user_id' => $row->user_id,
            'name' => $row->user?->name ?: 'Unknown',
            'score' => $row->score,
            'base_score' => $row->base_score,
            'completion_seconds' => $row->completion_seconds,
            'moves' => $row->moves,
            'hint_used' => (bool) $row->hint_used,
        ];
    }
}
