"""Run all adaptive SL experiments in parallel using multiprocessing."""
import pickle, time, json, sys
from multiprocessing import Pool, cpu_count
import numpy as np

def run_one(args):
    algo, th, seed = args
    from dctrading.envs.adaptive_sl_env import AdaptiveSLEnv, SL_LEVELS
    from dctrading.agents.zi_dct0 import ZiDCT0

    if algo == "DQN":
        from stable_baselines3 import DQN as Cls
        kwargs = dict(learning_rate=1e-4, batch_size=128, learning_starts=1000, gamma=0.99)
    else:
        from stable_baselines3 import PPO as Cls
        kwargs = dict(learning_rate=3e-4, n_steps=128, batch_size=64, n_epochs=10, gamma=0.99, ent_coef=0.01)

    train_ev, train_ind = pickle.load(open(f'data/cache/dc_1m_{th}_train.pkl', 'rb'))
    test_ev, test_ind = pickle.load(open(f'data/cache/dc_1m_{th}_test.pkl', 'rb'))
    with open('data/cache/train_2019_2024_1m.pkl', 'rb') as f:
        train_ticks = pickle.load(f)
    with open('data/cache/test_2025_1m.pkl', 'rb') as f:
        test_ticks = pickle.load(f)

    t0 = time.monotonic()
    env = AdaptiveSLEnv(dc_events=train_ev, dc_indicators=train_ind, ticks=train_ticks)
    model = Cls("MlpPolicy", env, device="cpu", seed=seed, **kwargs)
    model.learn(total_timesteps=200000)
    elapsed = time.monotonic() - t0

    def evaluate(events, indicators, ticks):
        e = AdaptiveSLEnv(dc_events=events, dc_indicators=indicators, ticks=ticks)
        obs, _ = e.reset(); done = False; sls = []
        while not done:
            a, _ = model.predict(obs, deterministic=True); sls.append(SL_LEVELS[int(a)])
            obs, _, t, tr, _ = e.step(int(a)); done = t or tr
        return ZiDCT0.summary(list(e._trade_history)), sls

    ts, _ = evaluate(train_ev, train_ind, train_ticks)
    s, sl = evaluate(test_ev, test_ind, test_ticks)
    avg_sl = np.mean([x for x in sl if x > 0]) * 100 if any(x > 0 for x in sl) else 0

    return {
        "algo": algo, "th": th, "seed": seed, "time": round(elapsed),
        "train_ret": round(ts["total_return_pct"], 2), "train_sharpe": round(ts["sharpe_ratio"], 4),
        "test_ret": round(s["total_return_pct"], 2), "test_sharpe": round(s["sharpe_ratio"], 4),
        "test_trades": s["num_trades"], "test_win": round(s["win_rate"], 2), "avg_sl": round(avg_sl, 1),
    }

if __name__ == "__main__":
    jobs = []
    for algo in ["DQN", "PPO"]:
        for th in [0.035, 0.055, 0.07]:
            for seed in range(10):
                jobs.append((algo, th, seed))

    print(f"Running {len(jobs)} experiments on {cpu_count()} cores...")
    t0 = time.monotonic()

    with Pool(processes=12) as pool:
        results = pool.map(run_one, jobs)

    total = time.monotonic() - t0
    print(f"\nAll done in {total:.0f}s\n")

    # Group and summarize
    for algo in ["DQN", "PPO"]:
        for th in [0.035, 0.055, 0.07]:
            group = [r for r in results if r["algo"] == algo and r["th"] == th]
            sharpes = [r["test_sharpe"] for r in group]
            rets = [r["test_ret"] for r in group]
            sls = [r["avg_sl"] for r in group]
            pos = sum(1 for r in rets if r > 0)
            print(f"{algo} λ={th}: median_sharpe={np.median(sharpes):.2f} median_ret={np.median(rets):+.1f}% worst={min(sharpes):.2f} best={max(sharpes):.2f} pos={pos}/10 avg_sl={np.mean(sls):.1f}%")
            for r in group:
                print(f"  s{r['seed']}: Tr={r['train_ret']:+.1f}% Sh={r['train_sharpe']:.2f} | Te={r['test_ret']:+.1f}% Sh={r['test_sharpe']:.2f} T={r['test_trades']} W={r['test_win']:.0%} SL={r['avg_sl']:.1f}% {r['time']}s")
            print()

    # Save results
    with open("data/cache/adaptive_sl_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Saved to data/cache/adaptive_sl_results.json")
