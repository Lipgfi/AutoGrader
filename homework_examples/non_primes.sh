#!/bin/bash

non_primes=()

for ((i=2; i<=100; i++)); do
    is_prime=1
    if [ $i -gt 2 ]; then
        for ((j=2; j*j<=i; j++)); do
            if [ $((i%j)) -eq 0 ]; then
                is_prime=0
                break
            fi
        done
    fi
    if [ $is_prime -eq 0 ]; then
        non_primes+=($i)
    fi
done

IFS=','
echo "${non_primes[*]}"