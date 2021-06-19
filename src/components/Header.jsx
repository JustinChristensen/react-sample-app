import PropTypes from 'prop-types';
import { usePropsOrState, useT, useUid } from '../hooks';
import { compose } from '../utils/fn.js';
import { actions } from '../reducers';

export const defaultOnDropdownToggleClick = e => {
    const firstItem = e.currentTarget.nextElementSibling.querySelector('.dropdown-item');
    firstItem.focus();
};

export const defaultOnDropdownMenuKeyUp = e => {
    const maybeFocusProfile = el => el && el.querySelector('.dropdown-item').focus();
    const li = e.target.closest('li');
    if (e.key === 'ArrowUp') maybeFocusProfile(li.previousElementSibling);
    else if (e.key === 'ArrowDown') maybeFocusProfile(li.nextElementSibling);
};

export const defaultOnSelectProfile = e => {
    e.preventDefault();
    e.$dispatch(actions.SELECT_PROFILE(Number(e.currentTarget.dataset.id)));
};

export const ProfileMenu = props => {
    const {
        $t,
        $uid,
        profiles,
        selectedProfile,
        onSelectProfile,
        onDropdownToggleClick,
        onDropdownMenuKeyUp
    } = compose(
        useUid,
        useT,
        usePropsOrState(s => ({
            profiles: s.profiles,
            selectedProfile: s.selectedProfile,
            onSelectProfile: defaultOnSelectProfile,
            onDropdownToggleClick: defaultOnDropdownToggleClick,
            onDropdownMenuKeyUp: defaultOnDropdownMenuKeyUp
        }))
    )(props);

    const unselectedProfiles = profiles.filter(p => p.id !== selectedProfile.id);
    const menuId = `profile-menu-${$uid}`;
    const buttonClasses = classes => `${classes} btn py-3 px-4 text-white`;

    return (
        <div className="header-menu dropdown d-inline-block" title={$t('header.profileMenu.hoverText')}>
            <button className={buttonClasses('selected-profile dropdown-toggle')} type="button" id={menuId}
                onClick={onDropdownToggleClick} onFocus={onDropdownToggleClick}>
                <i className="bi bi-person-circle"></i>
                <em className="ms-2 fst-normal">{selectedProfile.name}</em>
            </button>
            <ul className="dropdown-menu dropdown-menu-dark py-0 start-0 end-0" aria-labelledby={menuId} onKeyUp={onDropdownMenuKeyUp}>
                {unselectedProfiles.map(p => (
                    <li key={p.id}>
                        <button className={buttonClasses('dropdown-item')} type="button" onClick={onSelectProfile} data-id={p.id}>
                            <i className="bi bi-person-circle"></i>
                            <em className="ms-2 fst-normal">{p.name}</em>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

ProfileMenu.propTypes = {
    $uid: PropTypes.number,
    profiles: PropTypes.array,
    selectedProfile: PropTypes.object,
    onSelectProfile: PropTypes.func,
    onDropdownToggleClick: PropTypes.func,
    onDropdownMenuKeyUp: PropTypes.func
};

export const defaultOnSelectLocale = e => {
    e.preventDefault();
    e.$dispatch(actions.SET_LOCALE(e.currentTarget.dataset.loc));

    // TODO: selectedProfile.locale different from selectedMessages
    // when in SET_LOCALE, if messages for that locale are loaded, then set selectedMessages otherwise,
    // perform a fetch here, and in SET_MESSAGES check if selectedMessages differs from selectedProfile.locale
};

export const LocaleMenu = props => {
    const {
        $t,
        $uid,
        availableLocales,
        selectedLocale,
        onSelectLocale,
        onDropdownToggleClick,
        onDropdownMenuKeyUp
    } = compose(
        useUid,
        useT,
        usePropsOrState(s => ({
            availableLocales: s.availableLocales,
            selectedLocale: s.selectedProfile.locale,
            onSelectLocale: defaultOnSelectLocale,
            onDropdownToggleClick: defaultOnDropdownToggleClick,
            onDropdownMenuKeyUp: defaultOnDropdownMenuKeyUp
        }))
    )(props);

    const unselectedLocales = availableLocales.filter(l => l !== selectedLocale);
    const menuId = `locale-menu-${$uid}`;
    const flagClasses = loc => `flag-icon flag-icon-${loc}`;
    const buttonClasses = classes => `${classes} btn py-3 px-3 text-white`;

    return (
        <div className="header-menu dropdown d-inline-block" title={$t('header.localeMenu.hoverText')}>
            <button className={buttonClasses('selected-language dropdown-toggle')} type="button" id={menuId}
                onClick={onDropdownToggleClick} onFocus={onDropdownToggleClick}>
                <span className={flagClasses(selectedLocale)}></span>
            </button>
            <ul className="dropdown-menu dropdown-menu-dark py-0 start-0 end-0" aria-labelledby={menuId} onKeyUp={onDropdownMenuKeyUp}>
                {unselectedLocales.map(loc => (
                    <li key={loc}>
                        <button className={buttonClasses('dropdown-item')} type="button" onClick={onSelectLocale} data-loc={loc}>
                            <span className={flagClasses(loc)}></span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

LocaleMenu.propTypes = {
    $uid: PropTypes.number,
    selectedLocale: PropTypes.string,
    availableLocales: PropTypes.array,
    onSelectLocale: PropTypes.func,
    onDropdownToggleClick: PropTypes.func,
    onDropdownMenuKeyUp: PropTypes.func
};


export const Header = props => {
    const { $t } = useT(props);

    return (
        <header className="header container-fluid mb-4">
            <div className="row align-items-center">
                <div className="col">
                    <h2 className="my-2">{$t('header.heading')}</h2>
                </div>

                <div className="col">
                    <div className="float-end">
                        <LocaleMenu />
                        <ProfileMenu />
                    </div>
                </div>
            </div>
        </header>
    );
};
