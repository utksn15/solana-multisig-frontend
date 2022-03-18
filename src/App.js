// ownerA pubkey = Fo5yi9jR3JcdoYQEF1UtjamsoRuCRkpSyFpAaC7murde
// ownerB pubkey = 2Bx7seJC3RYuxXTx7V6QDX43y2NDnbrQB6f56A8VMvQf
// multisig account = djqFbLb4EJ4D4kchNSRuHuz2VQqLAN9Spi6wmzidqT3
// PDA = 7r12NwUX9YSdfkdoYA6Fg7d489wQKcpRsfKTr5K4ttfL
// nonce = 253

import './App.css';
import BN from 'bn.js';
import { useState } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from './idl.json';

import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
require('@solana/wallet-adapter-react-ui/styles.css');

// const {
//   createMint,
//   getMint,
//   createMintToInstruction,
// } = require('@solana/spl-token');

const wallets = [ new PhantomWalletAdapter() ]

const { SystemProgram } = web3;

function byteToUint8Array(byteArray) {
  var uint8Array = new Uint8Array(byteArray.length);
  for(var i = 0; i < uint8Array.length; i++) {
      uint8Array[i] = byteArray[i];
  }

  return uint8Array;
}

// hard coded for checking create_transaction
const multisig1 = new PublicKey("djqFbLb4EJ4D4kchNSRuHuz2VQqLAN9Spi6wmzidqT3");
const multisigSigner = new PublicKey("7r12NwUX9YSdfkdoYA6Fg7d489wQKcpRsfKTr5K4ttfL");
const ownerA_bytearray = require("/Users/utkarsh/Documents/solana/multisig-frontend/src/test_wallets/ownerA.json");
console.log('ownerA sk', ownerA_bytearray);
const ownerA = Keypair.fromSecretKey(byteToUint8Array(ownerA_bytearray));
console.log('ownerA keypair', ownerA);

const multisig = Keypair.generate();
console.log('new multisig keypair', multisig);
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

function App() {
  const [pubKey1, setPubKey1] = useState('');
  const [pubKey2, setPubKey2] = useState('');
  const [threshold, setThreshold] = useState('');
  const wallet = useWallet()

  async function getProvider() {
    /* create the provider and return it to the caller */
    const network = "https://api.devnet.solana.com";
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  // async function create_mint(){
  //   const network = "https://api.devnet.solana.com";
  //   const connection = new Connection(network, opts.preflightCommitment);
  //   //create new mint account
  //   let mint = await createMint(
  //       connection, 
  //       ownerA, // payer
  //       multisig.publicKey, //mint authority
  //       null, // freeze authority
  //       9, //decimals
  //   ); 

  //   console.log("mint account address:");
  //   console.log(mint.toBase58());

  //   var mintInfo = await getMint(
  //       connection,
  //       mint
  //   );

  //   console.log("mint account info:");
  //   console.log(mintInfo);

  //   const testAccount = new PublicKey("phbsZbbYBqKokdgLiRqNQyTgmoMzYgX7ADLSS1qpu2P");

  //   const mintIx = await createMintToInstruction(
  //     mint, // mint
  //     testAccount, // destination
  //     multisig.publicKey, // mint authority
  //     100,
  //   );

  //   console.log(mintIx);

  //   const provider = await getProvider();
  //   const program = new Program(idl, programID, provider);

    // const data = vec![*mintIx];

    // console.log(data);

  //   console.log('done');
  // }

  async function create_multisig() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);

    const [multisigSigner, nonce] =
      await PublicKey.findProgramAddress(
        [multisig.publicKey.toBuffer()],
        program.programId
      );
    
    console.log('PDA:', multisigSigner.toString());
    console.log('nonce:',nonce);

    const multisigSize = 200; // Big enough.

    const ownerA = new PublicKey(pubKey1);
    const ownerB = new PublicKey(pubKey2);

    console.log('owner A', ownerA);
    console.log('owner B', ownerB);
    
    const owners = [ownerA,ownerB];

    // const threshold = new BN(2);
    const threshold1 = new BN(threshold);
    console.log('threshold', threshold1);

    console.log('Enter create transaction');

    await program.rpc.createMultisig(owners, threshold1, nonce, {
      accounts: {
        multisig: multisig.publicKey,
      },
      instructions: [
        await program.account.multisig.createInstruction(
          multisig,
          multisigSize
        ),
      ],
      signers: [multisig],
    });

    console.log('created!')
  }
  //  const test_a = async function(){

  //   const network = "https://api.devnet.solana.com";
  //   const connection = new Connection(network, opts.preflightCommitment);
  //   //create new mint account
  //   let mint = await createMint(
  //       connection, 
  //       ownerA, // payer
  //       multisig, //mint authority
  //       null, // freeze authority
  //       9, //decimals
  //   ); 

  //   console.log("mint account address:");
  //   console.log(mint.toBase58());

  //   var mintInfo = await getMint(
  //       connection,
  //       mint
  //   );

  //   console.log("mint account info:");
  //   console.log(mintInfo);

  //   const testAccount = new PublicKey("HjDzCR11Z9f6FDtr1Y4tVzcZVRm1eNJKQfS8cbXwJ9Ej");

  //   const createMintToInstruction = await createMintToInstruction(
  //     mint, // mint
  //     testAccount, // destination
  //     multisig, // mint authority
  //     100,
  // );
  // }

  // test_a().then(() => {
  //   console.log("Success");
  // });

  // await mintTo(
  //     connection,
  //     feePayer, //payer
  //     mint,
  //     tokenAccount.address, //destination address
  //     feePayer, //mint authority
  //     100 //amount
  // );

  async function create_transaction() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);

    const pid = program.programId;
    console.log('pid',pid);
    const accounts = [
      {
        pubkey: multisig1,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: multisigSigner,
        isWritable: false,
        isSigner: true,
      },
    ];
    const newOwners = [ownerA.publicKey];
    const data = program.coder.instruction.encode("set_owners", {
      owners: newOwners,
    });

    const transaction = Keypair.generate();
    const txSize = 1000; // Big enough, cuz I'm lazy.
    console.log('Entering txn creation');
    await program.rpc.createTransaction(pid, accounts, data, {
      accounts: {
        multisig: multisig.publicKey,
        transaction: transaction.publicKey,
        proposer: ownerA.publicKey,
      },
      instructions: [
        await program.account.transaction.createInstruction(
          transaction,
          txSize
        ),
      ],
      signers: [transaction, ownerA],
    });

    console.log('txn creation success');

    const txAccount = await program.account.transaction.fetch(
      transaction.publicKey
    );

    console.log('txn created:', txAccount);
  }

  if (!wallet.connected) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop:'100px' }}>
        <WalletMultiButton />
      </div>
    )
  } else {
    return (
      <div className="App">
        <div>
          {
              <div>
                <input
                  placeholder="Enter pubKey 1"
                  onChange={e => setPubKey1(e.target.value)}
                  value={pubKey1}
                />
                <input
                  placeholder="Enter pubKey 2"
                  onChange={e => setPubKey2(e.target.value)}
                  value={pubKey2}
                />
                <input
                  placeholder="Threshold"
                  onChange={e => setThreshold(e.target.value)}
                  value={threshold}
                />
                <button onClick={create_multisig}>Create MultiSig</button>
                {/* <button onClick={create_mint}>Create Mint</button> */}
                {/* <button onClick={create_transaction}>Create Transaction</button> */}
              </div>
          }
        </div>
      </div>
    );
  }
}

const AppWithProvider = () => (
  <ConnectionProvider endpoint="https://api.devnet.solana.com">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

export default AppWithProvider; 