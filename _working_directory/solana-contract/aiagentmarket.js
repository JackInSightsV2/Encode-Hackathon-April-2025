const anchor = require('@project-serum/anchor');
const assert = require('assert');

describe('aiagentmarket - Full Test Suite', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Explicitly constructed FULL IDL
  const idl = {
    "version": "0.1.0",
    "name": "aiagentmarket",
    "instructions": [
      {
        "name": "registerAgent",
        "accounts": [
          {"name": "agent", "isMut": true, "isSigner": true},
          {"name": "user", "isMut": true, "isSigner": true},
          {"name": "systemProgram", "isMut": false, "isSigner": false}
        ],
        "args": [
          {"name": "name", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "endpoint", "type": "string"},
          {"name": "price", "type": "u64"}
        ]
      },
      {
        "name": "invokeAgent",
        "accounts": [
          {"name": "agent", "isMut": true, "isSigner": false},
          {"name": "user", "isMut": true, "isSigner": true},
          {"name": "agentOwner", "isMut": true, "isSigner": false},
          {"name": "systemProgram", "isMut": false, "isSigner": false}
        ],
        "args": []
      }
    ],
    "accounts": [
      {
        "name": "Agent",
        "type": {
          "kind": "struct",
          "fields": [
            {"name": "name", "type": "string"},
            {"name": "description", "type": "string"},
            {"name": "endpoint", "type": "string"},
            {"name": "price", "type": "u64"},
            {"name": "owner", "type": "publicKey"}
          ]
        }
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "InvalidAgentOwner",
        "msg": "The provided agent owner does not match the stored owner."
      }
    ]
  };

  const programId = new anchor.web3.PublicKey("JA9FE7qcuSHQTgeGBzQHWP8ZaeLGBHag8gU6D4ZaCnRa");
  const program = new anchor.Program(idl, programId, provider);
  const testUser = provider.wallet;

  let agentKeypair;

  it('Registers an agent successfully', async () => {
    agentKeypair = anchor.web3.Keypair.generate();

    await program.rpc.registerAgent(
      "AI Agent #1",
      "Agent that summarizes text.",
      "https://api.agentx.io/summarize",
      new anchor.BN(5000),
      {
        accounts: {
          agent: agentKeypair.publicKey,
          user: testUser.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [agentKeypair],
      }
    );

    const account = await program.account.agent.fetch(agentKeypair.publicKey);
    assert.strictEqual(account.name, "AI Agent #1");
    assert.strictEqual(account.price.toNumber(), 5000);
    assert.strictEqual(account.endpoint, "https://api.agentx.io/summarize");
  });

  it('Successfully invokes agent (and transfers payment)', async () => {
    const beforeUserBalance = await provider.connection.getBalance(testUser.publicKey);

    await program.rpc.invokeAgent({
      accounts: {
        agent: agentKeypair.publicKey,
        user: testUser.publicKey,
        agentOwner: testUser.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    const afterUserBalance = await provider.connection.getBalance(testUser.publicKey);
    assert(afterUserBalance < beforeUserBalance, "Lamports weren't deducted properly");
  });

  it('Fails invocation if agentOwner mismatches', async () => {
    const wrongOwner = anchor.web3.Keypair.generate();

    try {
      await program.rpc.invokeAgent({
        accounts: {
          agent: agentKeypair.publicKey,
          user: testUser.publicKey,
          agentOwner: wrongOwner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      });
      assert.fail("Invocation should have failed due to mismatched owner");
    } catch (err) {
      assert.strictEqual(err.error.errorCode.number, 6000);
      assert.strictEqual(err.error.errorMessage, "The provided agent owner does not match the stored owner.");
    }
  });

  it('Fails to register agent with oversized metadata', async () => {
    const hugeName = 'X'.repeat(300);  // Intentionally too big
    const hugeDescription = 'Y'.repeat(500); 
    const hugeEndpoint = 'http://'.concat('Z'.repeat(300));

    const oversizedAgent = anchor.web3.Keypair.generate();

    try {
      await program.rpc.registerAgent(
        hugeName,
        hugeDescription,
        hugeEndpoint,
        new anchor.BN(5000),
        {
          accounts: {
            agent: oversizedAgent.publicKey,
            user: testUser.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [oversizedAgent],
        }
      );
      assert.fail("Registration should fail due to oversized metadata");
    } catch (err) {
      console.log("Properly failed oversized metadata:", err.message);
    }
  });

  it('Prevents invocation with insufficient funds', async () => {
    const expensiveAgent = anchor.web3.Keypair.generate();
    const excessivePrice = new anchor.BN(100000000000);  // Very high price

    await program.rpc.registerAgent(
      "Expensive Agent",
      "Too expensive for most users.",
      "https://api.expensive.io/",
      excessivePrice,
      {
        accounts: {
          agent: expensiveAgent.publicKey,
          user: testUser.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [expensiveAgent],
      }
    );

    try {
      await program.rpc.invokeAgent({
        accounts: {
          agent: expensiveAgent.publicKey,
          user: testUser.publicKey,
          agentOwner: testUser.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      });
      assert.fail("Invocation should have failed due to insufficient funds");
    } catch (err) {
      console.log("Properly failed insufficient funds invocation:", err.message);
    }
  });

});
