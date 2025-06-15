import { useEffect, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';

import { beginCell } from '@ton/core';

import gift1 from './assets/gift-colored.webp'
import gift2 from './assets/gift-gold.webp'

import calendarGif from './gifs/calendar.gif';
import candyGif    from './gifs/candy.gif';
import hattGif     from './gifs/hatt.gif';
import drinkGif    from './gifs/drink.gif';
import eyeGif      from './gifs/eye.gif';
import roseGif     from './gifs/rose.gif';

import teddyGif    from './gifs/teddy.gif';
import giftGif     from './gifs/gift.gif';
import flowersGif  from './gifs/flowers.gif';
import trophyGif   from './gifs/trophy.gif';
import diamondGif  from './gifs/diamond.gif';
import hatGif      from './gifs/hat.gif';

import ton from "./assets/ton.webp";

const rewardGifs = {
    calendar: calendarGif,
    candy:    candyGif,
    hatt:     hattGif,
    drink:    drinkGif,
    eye:      eyeGif,
    rose:     roseGif,
    teddy:    teddyGif,
    gift:     giftGif,
    flowers:  flowersGif,
    trophy:   trophyGif,
    diamond:  diamondGif,
    hat:      hatGif,
};

function TopUpModal({ open, onClose, onSubmit }) {
    const [value, setValue] = useState('');
    const [tonConnectUI] = useTonConnectUI();

    useEffect(() => {
        window.Telegram?.WebApp?.ready();
    }, []);

    if (!open) return null;

    const generatePayload = (userId, username) => {
        const random = crypto.getRandomValues(new Uint8Array(8));
        const uniqueId = Array.from(random).map(b => b.toString(16).padStart(2, '0')).join('');
        const safeName = (username || '');

        const tag = `${userId}:${safeName}:${uniqueId}`;

        return beginCell()
            .storeUint(0, 32)
            .storeStringTail(tag)
            .endCell()
            .toBoc()
            .toString('base64');
    };

    const handleSubmit = async () => {
        const tg = window.Telegram.WebApp;
        const userId = tg?.initDataUnsafe?.user?.id;
        const username = tg?.initDataUnsafe?.user?.username ?? '';

        if (!userId)
            return;

        if (!tonConnectUI.connected) {
            await tonConnectUI.openModal();
            if (!tonConnectUI.connected) return;
        }

        const amount = parseFloat(value.replace(',', '.'));
        if (!amount || amount <= 0)
            return;

        const nanoAmount = Math.round(amount * 1e9).toString();
        const payload = generatePayload(userId, username);

        const transaction = {
            validUntil: Math.floor(Date.now() / 1e3) + 600,
            messages: [
                {
                    address: "UQA5PajFfxGphZ86hqDt7Fp3jccE40r49AJxy64gl8LqTLJA",
                    amount: nanoAmount,
                    payload: payload
                }
            ]
        };

        await tonConnectUI.sendTransaction(transaction)
        onSubmit(amount);
        setValue('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal topup-modal" onClick={e => e.stopPropagation()}>
                <div className="input-wrapper">
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="topup-input"
                    />
                    <img src={ton} alt="TON" className="modal-ton-icon" />
                </div>

                <button className="topup-btn" onClick={handleSubmit}>
                    Top-Up
                </button>
            </div>
        </div>
    );
}

function Balance() {
    const [tons, setTons] = useState(0);
    const [open, setOpen] = useState(false);

    const tg = window.Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id;

    useEffect(() => {
        if (!userId) return;
        fetch(`https://sapphiredrop.ansbackend.ch/balance?user_id=${userId}`)
            .then(r => r.json())
            .then(d => setTons(Number(d.balance ?? 0)))
            .catch(console.error);
    }, [userId]);

    return (
        <>
            <div className="balance-block">
                <div className="balance-price">
                    <img src={ton} alt="TON" className="balance-ton-icon" />
                    <span className="balance-count">{tons.toFixed(2)}</span>
                </div>

                <button
                    className="balance-plus-button"
                    onClick={() => setOpen(true)}
                    aria-label="TopUp"
                ></button>
            </div>

            <TopUpModal
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={() => setOpen(false)}
            />
        </>
    );
}

function RecentGiftsStrip() {
    const [latest, setLatest] = useState([]);

    useEffect(() => {
        fetch('https://sapphiredrop.ansbackend.ch/latest-gifts')
            .then(r => r.json())
            .then(data => setLatest(data.rewards || []))
            .catch(console.error);
    }, []);

    if (!latest.length) return null;

    const reversed = [...latest].reverse();

    return (
        <div className="recent-strip-container">
            <div className="recent-strip-header">
                Latest Drops
            </div>
            <div className="recent-strip">
                {reversed.map((key, i) => (
                    <div className="strip-item" key={`${key}-${i}`}>
                        <img src={rewardGifs[key]} alt={key} className="strip-img" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function Menu({ onStandard, onUniqueCollectible }) {
    return (
        <div className="container">

            <RecentGiftsStrip />
            <Balance />

            <div className="gift-block" onClick={onStandard}>
                <img src={gift1} alt="Gift" className="gift-img" />
                <div className="gift-label-container">
                    <h1 className="label">Unlock Standard</h1>
                    <div className="gift-price">
                        <img src={ton} alt="" className="gift-price-ton-icon" />0.15
                    </div>
                </div>
            </div>

            <div className="gift-block" onClick={onUniqueCollectible}>
                <img src={gift2} alt="Gold gift" className="gift-img" />
                <div className="gift-label-container">
                    <h1 className="label">Unlock Collectible</h1>
                    <div className="gift-price">
                        <img src={ton} alt="" className="gift-price-ton-icon" />3
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Menu