package com.tka.feasto.entity;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import jakarta.persistence.Cacheable;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor

@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Address {
	private String street;
	private String city;
	private String state;
	private String postalCode;
	private String country;
	private Double latitude;
	private Double longitude;
}