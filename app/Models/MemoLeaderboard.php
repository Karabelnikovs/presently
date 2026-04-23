<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemoLeaderboard extends Model
{
    use HasFactory;

    protected $table = 'memo_leaderboard';

    protected $fillable = [
        'user_id',
        'score',
        'base_score',
        'completion_seconds',
        'moves',
        'hint_used',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
