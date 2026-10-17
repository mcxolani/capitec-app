package com.capitec.demo.branch;

public record Branch(
        String id,
        String name,
        String address,
        Position position,
        String phone,
        String hours
) {
    public record Position(double lat, double lng) {
    }
}
