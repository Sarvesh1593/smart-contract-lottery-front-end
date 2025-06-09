import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import React, { useCallback, useEffect, useState } from "react";
import { formatUnits } from "ethers";
import { useNotification } from "@web3uikit/core";
//
export default function LotteryEntrance() {
  const dispatcher = useNotification();
  const [entranceFee, setEntranceFee] = useState<string>();
  const [numPlayers, setnumOfPlayer] = useState<string | null | undefined>();
  const [recentWinner, setRecentWinner] = useState<string | null | undefined>();

  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis() || {};
  const chainId = chainIdHex ? parseInt(chainIdHex).toString() : "";

  type ChainId = keyof typeof contractAddresses;

  let raffleAddress: string | null = null,
    address;

  if (chainId in contractAddresses) {
    raffleAddress = contractAddresses[chainId as ChainId][0];
    address = raffleAddress === null ? undefined : raffleAddress;
  }

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: address,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  // console.log(isWeb3Enabled);

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: address,
    functionName: "getEntranceFee",
    params: {},
  });
  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: address,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: address,
    functionName: "getRecentWinner",
    params: {},
  });
  const updateUI = useCallback(async function () {
    try {
      const fee = await getEntranceFee();
      const numPlayersFromCall = await getNumberOfPlayers();
      const recentWinnerFromCall = await getRecentWinner();

      if (fee) {
        setEntranceFee(fee.toString());
      }

      if (numPlayersFromCall !== undefined && numPlayersFromCall !== null) {
        // Cast to string assuming it's a BigNumber or number
        setnumOfPlayer(numPlayersFromCall.toString());
      }

      if (recentWinnerFromCall && typeof recentWinnerFromCall === "string") {
        setRecentWinner(recentWinnerFromCall);
        console.log(recentWinner);
      } else {
        setRecentWinner(null);
      }
    } catch (error) {
      console.error("Error updating UI:", error);
    }
  }, []);

  // console.log(raffleAddress);
  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled, updateUI]);

  const handleSuccess = async function () {
    // await tx.wait(1);
    handleNotification();
    console.log("Handle Success is called");
    updateUI();
  };

  const handleNotification = function () {
    dispatcher({
      type: "info",
      message: "Transaction Completed",
      title: "Transaction Notification",
      position: "topR",
      // icon: React.createElement,
    });
  };
  return (
    <div className="p-5">
      Hii from lottery Entrance
      {address ? (
        <div>
          <button
            onClick={async function () {
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => {
                  console.error("Transaction error:", error);

                  // Extract meaningful message from the error object
                },
              });
            }}
            disabled={isLoading || isFetching}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Enter Raffle
          </button>
          <div>
            Entrance Fee : {formatUnits(entranceFee ?? "0", "ether")} ETH
          </div>
          <div>Players : {numPlayers}</div>
          <div>Recent Winner : {recentWinner}</div>
        </div>
      ) : (
        <div> No Raffle Address </div>
      )}
      {}
    </div>
  );
}
