---
description: Run the full verification suite after any significant change
---

Run the full verification suite for this project.

1. Run `npm test -- --runInBand` to run the test suite serially. The suite uses Supertest and exercises all API endpoints directly, so if the tests pass, the server and all endpoints are working correctly.
2. If any tests fail, fix the implementation and run the tests again. Repeat until all tests pass.
3. Report the result clearly: either all tests are passing and all endpoints are verified, or list the specific failures that still need addressing.
