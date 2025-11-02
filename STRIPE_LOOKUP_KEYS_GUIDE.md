# Stripe Lookup Keys Configuration Guide

This guide explains how to configure Stripe lookup keys for the HawkMail application. Lookup keys are essential for the payment buttons to work correctly, as they allow the frontend to request pricing information from Stripe without hardcoding price IDs.

## Why are Lookup Keys Needed?

Instead of hardcoding Stripe Price IDs in your application code (e.g., `price_1J2w3e4F5g6h7i8j9k0l1m2n`), you can use lookup keys (e.g., `hawkmail_pro_monthly`). This has several advantages:

-   **Flexibility:** You can change the price in the Stripe dashboard without needing to change your code.
-   **Readability:** The keys are human-readable, making the code easier to understand.
-   **Security:** You don't expose your Price IDs in the client-side code.

## Configuration Steps

1.  **Log in to your Stripe Dashboard.**
2.  **Navigate to the Products section.**
3.  **Select the product for which you want to create a lookup key.** (e.g., "HawkMail Pro")
4.  **Find the price you want to associate with a lookup key.**
5.  **Click on the three dots (...) next to the price and select "Edit price".**
6.  **In the "Price details" section, you will find a field for "Lookup key".**
7.  **Enter a unique, descriptive key for the price.** We recommend the following convention:
    *   `hawkmail_basic_monthly`
    *   `hawkmail_pro_monthly`
    *   `hawkmail_enterprise_yearly`
8.  **Save the price.**
9.  **Repeat this process for all the prices you want to use in the application.**

## Important Notes

*   Make sure the lookup keys you configure in Stripe match the ones used in the application's code.
*   If you change a price, you can simply create a new price and associate the same lookup key with it. This will automatically update the pricing in the application without any code changes.
*   You can find the code that uses these lookup keys in the frontend components that handle the checkout process.
