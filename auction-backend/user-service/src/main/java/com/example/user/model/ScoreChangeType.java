package com.example.user.model;

public enum ScoreChangeType {
    DEDUCT("Deduct score"),
    ADD("Add score"),
    PENALTY("Penalty"),
    REWARD("Reward"),
    INITIAL("Initial score"),
    ADJUSTMENT("Adjustment score");

    private final String description;

    ScoreChangeType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}