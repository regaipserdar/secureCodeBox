// SPDX-FileCopyrightText: 2021 iteratec GmbH
//
// SPDX-License-Identifier: Apache-2.0

const { scan } = require("../../../tests/integration/helpers");

jest.retryTimes(3);

test(
  "typo3scan scans old-typo3 for vulnerable extensions and core only",
  async () => {
    const { categories, severities, count } = await scan(
      "typo3scan-old-typo3",
      "typo3scan",
      ["-d", "http://old-typo3.demo-targets.svc", "--vuln"],
      90
    );

    expect(count).toBe(10);
    expect(categories).toMatchInlineSnapshot(`
      Object {
        "Vulnerability": 10,
      }
    `);
    expect(severities).toMatchInlineSnapshot(`
      Object {
        "high": 10,
      }
    `);
  },
  3 * 60 * 1000
);

test(
  "Invalid argument should be marked as errored",
  async () => {
    await expect(
      scan(
        "typo3scan-invalidArg",
        "typo3scan",
        ["--invalidArg", "example.com"],
        90
      )
    ).rejects.toThrow("HTTP request failed");
  },
  3 * 60 * 1000
);
