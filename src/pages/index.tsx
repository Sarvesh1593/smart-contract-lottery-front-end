import Head from "next/head";
import ManualHeader from "../../components/Header";
import LotteryEntrance from "../../components/LotteryEntrance";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Smart Lottery</title>
        <meta name="description" content="Our Smart contract Library" />
      </Head>
      <ManualHeader />
      <LotteryEntrance />
      {}
    </div>
  );
}
