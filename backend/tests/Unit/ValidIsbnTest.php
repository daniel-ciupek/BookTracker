<?php

use App\Rules\ValidIsbn;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

uses(TestCase::class);

describe('ValidIsbn rule', function () {
    function isbnPasses(string $value): bool
    {
        $validator = Validator::make(
            ['isbn' => $value],
            ['isbn' => [new ValidIsbn]]
        );

        return $validator->passes();
    }

    describe('ISBN-10', function () {
        it('accepts a valid ISBN-10', function () {
            expect(isbnPasses('0306406152'))->toBeTrue();
        });

        it('accepts a valid ISBN-10 with X check digit', function () {
            expect(isbnPasses('097522980X'))->toBeTrue();
        });

        it('rejects an ISBN-10 with wrong check digit', function () {
            expect(isbnPasses('0306406151'))->toBeFalse();
        });

        it('rejects an ISBN-10 with non-numeric characters (except X)', function () {
            expect(isbnPasses('030640615A'))->toBeFalse();
        });
    });

    describe('ISBN-13', function () {
        it('accepts a valid ISBN-13', function () {
            expect(isbnPasses('9780306406157'))->toBeTrue();
        });

        it('accepts another valid ISBN-13', function () {
            expect(isbnPasses('9783161484100'))->toBeTrue();
        });

        it('rejects an ISBN-13 with wrong check digit', function () {
            expect(isbnPasses('9780306406158'))->toBeFalse();
        });

        it('rejects an ISBN-13 with non-numeric characters', function () {
            expect(isbnPasses('978030640615X'))->toBeFalse();
        });
    });

    describe('invalid formats', function () {
        it('rejects a string that is too short', function () {
            expect(isbnPasses('123456'))->toBeFalse();
        });

        it('rejects a string that is too long', function () {
            expect(isbnPasses('97803064061570'))->toBeFalse();
        });
    });
});
