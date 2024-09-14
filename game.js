const crypto = require("crypto");
const readline = require("readline");
const { Table } = require("console-table-printer");

class RulesTableGenerator {
  constructor(moves) {
    this.moves = moves;
  }

  generateTable() {
    const n = this.moves.length;
    const table = {};

    const p = new Table({
      columns: [{ name: "v PC \\ User >", alignment: "left", color: "white" }],
    });

    for (let i = 0; i < n; i++) {
      let tempRow = { "v PC \\ User >": this.moves[i] };
      for (let j = 0; j < n; j++) {
        if (i === j) {
          tempRow[this.moves[j]] = "Draw";
        } else if ((j - i + n) % n <= Math.floor(n / 2)) {
          tempRow[this.moves[j]] = "Wins";
        } else {
          tempRow[this.moves[j]] = "Lose";
        }
      }
      p.addRow(tempRow);
    }

    p.printTable();
  }
}

class GameRules {
  constructor(moves) {
    this.moves = moves;
  }

  getResult(playerMove, computerMove) {
    const playerIndex = this.moves.indexOf(playerMove);
    const computerIndex = this.moves.indexOf(computerMove);
    const n = this.moves.length;
    let p = Math.floor(n / 2);
    if (playerIndex === computerIndex) return "Draw";
    if (Math.sign(((computerIndex - playerIndex + p + n) % n) - p) === 1)
      return "Win";
    return "Lose";
  }
}

class CryptoUtils {
  static generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  static generateHMAC(key, message) {
    return crypto.createHmac("sha256", key).update(message).digest("hex");
  }
}

function main() {
  const args = process.argv.slice(2);

  if (
    args.length < 3 ||
    args.length % 2 === 0 ||
    new Set(args).size !== args.length
  ) {
    console.error(
      "Error: Incorrect input. You must provide an odd number of non-repeating moves (≥ 3). Example: node game.js Rock Paper Scissors"
    );
    return;
  }

  const moves = args;
  const rulesTableGenerator = new RulesTableGenerator(moves);
  const gameRules = new GameRules(moves);

  const key = CryptoUtils.generateKey();
  const computerMove = moves[Math.floor(Math.random() * moves.length)];
  const hmac = CryptoUtils.generateHMAC(key, computerMove);

  console.log(`HMAC: ${hmac}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function showMenu() {
    console.log("\nAvailable moves:");
    moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log("0 - Exit");
    console.log("help - Help");
  }

  function askForMove() {
    showMenu();
    rl.question("Enter your move: ", (choice) => {
      if (choice === "0") {
        rl.close();
        return;
      } else if (choice === "help") {
        rulesTableGenerator.generateTable();
        askForMove();
      } else {
        const playerMove = moves[parseInt(choice) - 1];
        if (!playerMove) {
          console.log("Invalid choice, please try again.");
          askForMove();
          return;
        }

        console.log(`Your move: ${playerMove}`);
        console.log(`Computer move: ${computerMove}`);
        console.log(`Key: ${key}`);
        const result = gameRules.getResult(playerMove, computerMove);
        console.log(`Result: ${result}`);
        console.log(
          `Check here:\nhttps://emn178.github.io/online-tools/sha256.html?input=${computerMove}&input_type=utf-8&output_type=hex&hmac_enabled=1&hmac_input_type=utf-8&hmac_key=${key}`
        );

        rl.close();
      }
    });
  }

  askForMove();
}

main();
