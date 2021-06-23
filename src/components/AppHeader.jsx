import PropTypes from 'prop-types';
import { usePropsSelector, useT, useUid, useHandlers } from '../hooks';
import { compose, identity } from '../utils/fn.js';
import { actions } from '../reducers';
import { detectBrowserLocale, fetchMissingMessages } from '../lang.js';
import { sitePath } from '../utils/env.js';

export const defaultOnDropdownMenuKeyUp = e => {
    const maybeFocusItem = el => el && el.querySelector('.dropdown-item').focus();
    const li = e.target.closest('li');
    if (e.key === 'ArrowUp') maybeFocusItem(li.previousElementSibling);
    else if (e.key === 'ArrowDown') maybeFocusItem(li.nextElementSibling);
};

export const HeaderMenu = props => {
    const {
        $uid,
        items,
        selectedItem,
        itemIdFn,
        hoverText,
        renderItem,
        onDropdownMenuKeyUp,
        onDropdownMenuClick,
    } = compose(
        useUid,
        usePropsSelector(s => ({
            itemIdFn: identity,
        })),
        useHandlers({
            onDropdownMenuKeyUp: defaultOnDropdownMenuKeyUp
        })
    )(props);

    const unselectedItems = items.filter(p => p.id !== itemIdFn(selectedItem));
    const menuId = `header-menu-${$uid}`;
    const buttonClasses = classes => `${classes} btn py-3 px-4 text-white`;

    return (
        <div className="header-menu dropdown d-inline-block" title={hoverText}>
            <button className={buttonClasses('dropdown-toggle')} type="button" id={menuId}>
                {renderItem(selectedItem)}
            </button>
            <ul className="dropdown-menu dropdown-menu-dark py-0 start-0 end-0" aria-labelledby={menuId} onKeyUp={onDropdownMenuKeyUp}>
                {unselectedItems.map(item => (
                    <li key={itemIdFn(item)}>
                        <button className={buttonClasses('dropdown-item')} type="button" onClick={onDropdownMenuClick} data-id={itemIdFn(item)}>
                            {renderItem(item)}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

HeaderMenu.propTypes = {
    $uid: PropTypes.number,
    items: PropTypes.array,
    selectedItem: PropTypes.any,
    itemIdFn: PropTypes.func,
    renderItem: PropTypes.func,
    onDropdownMenuKeyUp: PropTypes.func,
    onDropdownMenuClick: PropTypes.func
};

export const defaultOnSelectProfile = e => {
    e.preventDefault();

    e.$dispatch(actions.SELECT_PROFILE({
        id: Number(e.currentTarget.dataset.id),
        browserLocale: detectBrowserLocale()
    }));

    fetchMissingMessages(e.$getState, e.$dispatch);
};

export const defaultOnSelectLocale = e => {
    e.preventDefault();
    e.$dispatch(actions.SET_LOCALE({ locale: e.currentTarget.dataset.id }));
    fetchMissingMessages(e.$getState, e.$dispatch);
};

export const AppHeader = props => {
    const {
        $t,
        availableLocales,
        selectedLocale,
        onSelectLocale,
        profiles,
        selectedProfile,
        onSelectProfile
    } = compose(
        useT,
        usePropsSelector(s => ({
            availableLocales: s.availableLocales,
            selectedLocale: s.selectedProfile.locale,
            profiles: s.profiles,
            selectedProfile: s.selectedProfile,
        })),
        useHandlers({
            onSelectLocale: defaultOnSelectLocale,
            onSelectProfile: defaultOnSelectProfile
        })
    )(props);

    const flagClasses = loc => `flag-icon flag-icon-${loc}`;

    return (
        <header className="header container-fluid mb-4">
            <div className="row align-items-center">
                <div className="col">
                    <h2 className="my-2">
                        <a href={sitePath} className="text-white text-decoration-none">{$t('header.heading')}</a>
                    </h2>
                </div>

                <div className="col">
                    <div className="float-end">
                        <HeaderMenu items={availableLocales} selectedItem={selectedLocale} hoverText={$t('header.localeMenu.hoverText')}
                            onDropdownMenuClick={onSelectLocale} renderItem={locale => (
                                <span className={flagClasses(locale)}></span>
                            )} />
                        <HeaderMenu items={profiles} selectedItem={selectedProfile} itemIdFn={profile => profile.id} hoverText={$t('header.profileMenu.hoverText')}
                            onDropdownMenuClick={onSelectProfile} renderItem={profile => (
                                <>
                                    <i className="bi bi-person-circle"></i>
                                    <em className="ms-2 fst-normal">{profile.name}</em>
                                </>
                            )} />
                    </div>
                </div>
            </div>
        </header>
    );
};
